let currentUser = null;
let editingHeadId = null;

// Check authentication state
function checkAuthState() {
    const allowedEmails = [
        'aneel@aryservices.com.pk',
        'admin@aryservices.com.pk',
        'qasim@aryservices.com.pk',
        'reports@aryservices.com.pk'
    ];

    auth.onAuthStateChanged(function(user) {
        if (!user || !allowedEmails.includes(user.email)) {
            window.location.href = '/';
        } else {
            currentUser = user;
            loadHeads();
        }
    });
}

// Logout function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            window.location.href = '/';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error during logout: ' + error.message);
        });
    }
}

// Go back to dashboard
function goBack() {
    window.location.href = 'dashboard.html';
}

// Show loading overlay
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Show success modal
function showSuccess(message) {
    document.getElementById('success-message').textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

// Add new head
function addHead(headData) {
    showLoading();
    
    // Add timestamp and user info
    headData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    headData.createdBy = currentUser.email;
    headData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    db.collection("head")
        .add(headData)
        .then((docRef) => {
            console.log("Head added with ID: ", docRef.id);
            hideLoading();
            showSuccess('Head added successfully!');
            
            // Reset form
            document.getElementById('add-head-form').reset();
            document.getElementById('headStatus').value = 'active';
            
            // Reload heads list
            loadHeads();
        })
        .catch((error) => {
            console.error("Error adding head: ", error);
            hideLoading();
            alert("Error adding head: " + error.message);
        });
}

// Load heads from Firestore
function loadHeads() {
    const tableBody = document.getElementById('heads-table-body');
    
    db.collection("head")
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">No heads found. Add a new head to get started.</td>
                    </tr>
                `;
                return;
            }
            
            let tableHTML = '';
            
            querySnapshot.forEach((doc) => {
                const head = doc.data();
                const createdDate = head.createdAt ? head.createdAt.toDate().toLocaleDateString() : 'N/A';
                const statusBadge = head.status === 'active' ? 
                    '<span class="badge bg-success">Active</span>' : 
                    '<span class="badge bg-secondary">Inactive</span>';
                
                tableHTML += `
                    <tr>
                        <td><strong>${head.name}</strong></td>
                        <td>${head.code || '-'}</td>
                        <td>${head.category || '-'}</td>
                        <td>${statusBadge}</td>
                        <td>${createdDate}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editHead('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteHead('${doc.id}', '${head.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            tableBody.innerHTML = tableHTML;
        })
        .catch((error) => {
            console.error("Error loading heads: ", error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-danger">
                        Error loading heads: ${error.message}
                    </td>
                </tr>
            `;
        });
}

// Edit head
function editHead(headId) {
    db.collection("head").doc(headId).get()
        .then((doc) => {
            if (doc.exists) {
                const head = doc.data();
                editingHeadId = headId;
                
                // Populate edit form
                document.getElementById('edit-head-id').value = headId;
                document.getElementById('edit-headName').value = head.name;
                document.getElementById('edit-headCode').value = head.code || '';
                document.getElementById('edit-headStatus').value = head.status || 'active';
                document.getElementById('edit-headCategory').value = head.category || '';
                document.getElementById('edit-headDescription').value = head.description || '';
                
                // Show edit modal
                const modal = new bootstrap.Modal(document.getElementById('editModal'));
                modal.show();
            } else {
                alert("Head not found!");
            }
        })
        .catch((error) => {
            console.error("Error loading head: ", error);
            alert("Error loading head: " + error.message);
        });
}

// Update head
function updateHead() {
    if (!editingHeadId) return;
    
    const headData = {
        name: document.getElementById('edit-headName').value.trim(),
        code: document.getElementById('edit-headCode').value.trim(),
        status: document.getElementById('edit-headStatus').value,
        category: document.getElementById('edit-headCategory').value,
        description: document.getElementById('edit-headDescription').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: currentUser.email
    };

    if (!headData.name) {
        alert('Head name is required');
        return;
    }

    showLoading();
    
    db.collection("head").doc(editingHeadId)
        .update(headData)
        .then(() => {
            hideLoading();
            showSuccess('Head updated successfully!');
            
            // Hide edit modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
            
            // Reload heads list
            loadHeads();
            editingHeadId = null;
        })
        .catch((error) => {
            console.error("Error updating head: ", error);
            hideLoading();
            alert("Error updating head: " + error.message);
        });
}

// Delete head
function deleteHead(headId, headName) {
    if (confirm(`Are you sure you want to delete "${headName}"? This action cannot be undone.`)) {
        showLoading();
        
        db.collection("head").doc(headId)
            .delete()
            .then(() => {
                hideLoading();
                showSuccess('Head deleted successfully!');
                loadHeads();
            })
            .catch((error) => {
                console.error("Error deleting head: ", error);
                hideLoading();
                alert("Error deleting head: " + error.message);
            });
    }
}

// Form submit handler
document.getElementById('add-head-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const headData = {
        name: document.getElementById('headName').value.trim(),
        code: document.getElementById('headCode').value.trim(),
        status: document.getElementById('headStatus').value,
        category: document.getElementById('headCategory').value,
        description: document.getElementById('headDescription').value.trim()
    };

    if (!headData.name) {
        alert('Head name is required');
        return;
    }

    if (!headData.status) {
        alert('Status is required');
        return;
    }

    addHead(headData);
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to logout button
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    // Check authentication state
    checkAuthState();
});