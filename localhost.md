Ah, you're using Firebase Hosting's local development server! Here's how to make `firebase serve` accessible from IP 192.168.99.129:

## Method 1: Use the --host Flag (Recommended)

```bash
firebase serve --host 0.0.0.0 --port 5000
```

This binds the Firebase development server to all network interfaces, making it accessible from any IP on your network.

## Method 2: Specify the Exact IP

```bash
firebase serve --host 192.168.99.129 --port 5000
```

This binds specifically to your machine's IP address.

## Method 3: Full Configuration with Multiple Options

```bash
firebase serve --host 0.0.0.0 --port 5000 --only hosting
```

## Access Your App:

Once you run the command with `--host 0.0.0.0`, you can access your Firebase app from:

- **Same machine**: `http://localhost:5000` or `http://127.0.0.1:5000`
- **Other devices on network**: `http://192.168.99.129:5000`
- **Your IP from any device**: `http://192.168.99.129:5000`

## Example Output:
```bash
$ firebase serve --host 0.0.0.0 --port 5000

✔  hosting: Local server: http://0.0.0.0:5000
✔  hosting: Local server: http://192.168.99.129:5000
```

## Additional Options:

You can also configure this in your `firebase.json`:

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  },
  "emulators": {
    "hosting": {
      "host": "0.0.0.0",
      "port": 5000
    }
  }
}
```

## Security Note:
When using `--host 0.0.0.0`, your development server becomes accessible to anyone on your network. Only use this on trusted networks!

Try: `firebase serve --host 0.0.0.0 --port 5000` and then access `http://192.168.99.129:5000` from any device on your network! 🚀


## Config for XAMPP to 0.0.0.0
To make XAMPP accessible on your local network so other devices can access it using your IP address (http://192.168.99.129/), you'll need to configure Apache to allow external connections. Here's how to do it:

## Method 1: Edit httpd.conf (Recommended)

1. **Open XAMPP Control Panel** and stop Apache if it's running
2. **Navigate to your XAMPP installation folder** (usually `C:\xampp\apache\conf\`)
3. **Open `httpd.conf`** in a text editor
4. **Find the line** that contains:
   ```
   Listen 80
   ```
5. **Change it to:**
   ```
   Listen 0.0.0.0:80
   ```
6. **Save the file and restart Apache** from the XAMPP Control Panel

## Method 2: Configure Virtual Host (Alternative)

1. **Open `httpd-vhosts.conf`** (in `C:\xampp\apache\conf\extra\`)
2. **Add this configuration:**
   ```apache
   <VirtualHost *:80>
       DocumentRoot "C:/xampp/htdocs"
       ServerName 192.168.99.129
       <Directory "C:/xampp/htdocs">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

## Check Windows Firewall

Make sure Windows Firewall allows Apache through:
1. Open **Windows Defender Firewall**
2. Go to **"Allow an app or feature through Windows Defender Firewall"**
3. Make sure **Apache HTTP Server** is checked for both private and public networks

## Test the Connection

After making these changes:
1. Restart Apache from XAMPP Control Panel
2. Test locally: `http://localhost` or `http://127.0.0.1`
3. Test from another device on your network: `http://192.168.99.129`

**Note:** I noticed you wrote "198.168.99.129" in your message - make sure you're using the correct IP address. Private network IPs typically start with 192.168.x.x, 10.x.x.x, or 172.16.x.x to 172.31.x.x.

If you're still having issues, check that your IP address is correct by running `ipconfig` in Command Prompt to verify your actual local IP address.