// ================================================
// UNIVERSAL NAVBAR COMPONENT
// File: /assets/js/navbar.js
// Usage: Include this script in all pages after Firebase
// ================================================



class UniversalNavbar {
    constructor() {
        this.currentPath = window.location.pathname;
        this.init();
    }

    init() {
        this.injectNavbarHTML();
        this.setupEventListeners();
        this.setActivePage();
        this.loadUserInfo();
    }

    injectNavbarHTML() {
        const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
            <div class="container-fluid">
                <!-- Brand/Logo -->
                <a class="navbar-brand" href="/src/pages/dashboard.html">
                    <i class="fas fa-file-invoice-dollar me-2"></i>
                    ORSYS-ARY
                </a>

                <!-- Mobile Toggle -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Navbar Content -->
                <div class="collapse navbar-collapse" id="mainNavbar">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        
                        <!-- Dashboard -->
                        <li class="nav-item">
                            <a class="nav-link" href="/src/pages/dashboard.html" data-page="dashboard">
                                <i class="fas fa-home me-1"></i> Home
                            </a>
                        </li>

                        <!-- Create Voucher Dropdown -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="createDropdown" role="button" 
                               data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-plus-circle me-1"></i> Create Voucher
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="createDropdown">
                                <li>
                                    <a class="dropdown-item" href="/src/pages/vouchers/receipt.html">
                                        <i class="fas fa-money-bill-wave me-2 text-success"></i>
                                        Cash Receipt Voucher (CRV)
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/dv/index.html">
                                        <i class="fas fa-hand-holding-usd me-2 text-danger"></i>
                                        Cash Payment Voucher (CPV)
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- View & Print Dropdown -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="viewDropdown" role="button" 
                               data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-eye me-1"></i> View & Print
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="viewDropdown">
                                <li>
                                    <a class="dropdown-item" href="/src/pages/vouchers/">
                                        <i class="fas fa-receipt me-2 text-success"></i>
                                        CRV Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/dashboard4dv/">
                                        <i class="fas fa-file-invoice me-2 text-danger"></i>
                                        CPV Dashboard
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/vouchers/verify.html">
                                        <i class="fas fa-check-circle me-2 text-info"></i>
                                        Verify Voucher
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- Reports Dropdown -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="reportsDropdown" role="button" 
                               data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-chart-bar me-1"></i> Reports
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="reportsDropdown">
                                <li>
                                    <a class="dropdown-item" href="/crud/">
                                        <i class="fas fa-database me-2 text-primary"></i>
                                        All Records
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="#" onclick="window.navbarInstance.generateReport('crv')">
                                        <i class="fas fa-file-export me-2 text-success"></i>
                                        CRV Report
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" onclick="window.navbarInstance.generateReport('cpv')">
                                        <i class="fas fa-file-export me-2 text-danger"></i>
                                        CPV Report
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- Admin Dropdown -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" 
                               data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-user-shield me-1"></i> Admin
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                                <li>
                                    <a class="dropdown-item" href="/backup-restore.html">
                                        <i class="fas fa-database me-2"></i>
                                        Backup &amp; Restore
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/admin/add-head.html">
                                        <i class="fas fa-user-plus me-2"></i>
                                        Add Head
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/admin/dv/update.html">
                                        <i class="fas fa-tasks me-2"></i>
                                        DV Management
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/src/pages/admin/cv/update.html">
                                        <i class="fas fa-tasks me-2"></i>
                                        CV Management
                                    </a>
                                </li>                                
                            </ul>
                        </li>
                    </ul>

                    <!-- Right Side Items -->
                    <div class="d-flex align-items-center">
                        <!-- User Info -->
                        <span class="navbar-text user-info me-3" id="DisplayUserName">
                            <i class="fas fa-user-circle me-2"></i>
                            <span id="userName">Loading...</span>
                        </span>

                        <!-- Logout Button -->
                        <button class="btn btn-outline-light btn-sm" id="logout-btn">
                            <i class="fas fa-sign-out-alt me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <br>
        `;

        // Insert navbar at the beginning of body
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navbarHTML;
        document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);
    }

    
    setupEventListeners() {
        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    setActivePage() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (this.currentPath === href || this.currentPath.startsWith(href + '/') || 
                (href === '/' && this.currentPath === '/dashboard.html'))) {
                link.classList.add('active');
            }
        });
    }

    loadUserInfo() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded');
            return;
        }

        firebase.auth().onAuthStateChanged((user) => {
            const userNameElement = document.getElementById('userName');
            
            if (user) {
                let userName = user.displayName || user.email.split('@')[0] || 'User';
                
                // Capitalize first letter
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);

                if (userNameElement) {
                    userNameElement.textContent = 'Welcome! ' + userName;
                }
            } else {
                // Redirect to login if not authenticated (except on login page)
                if (!this.currentPath.includes('index.html') && 
                    this.currentPath !== '/' && 
                    !this.currentPath.includes('login')) {
                    window.location.href = '/index.html';
                }
            }
        });
    }

    handleLogout() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded');
            return;
        }

        if (confirm('Are you sure you want to logout?')) {
            firebase.auth().signOut()
                .then(() => {
                    console.log('User signed out successfully');
                    window.location.href = '/index.html';
                })
                .catch((error) => {
                    console.error('Logout error:', error);
                    alert('Error logging out. Please try again.');
                });
        }
    }

    generateReport(type) {
        alert(`Generating ${type.toUpperCase()} report...`);
        console.log(`Report type requested: ${type}`);
    }
}

// Initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.navbarInstance = new UniversalNavbar();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalNavbar;
}