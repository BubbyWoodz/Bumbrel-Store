# Submitting and Installing Your Spotify Backend App for Umbrel

This guide explains how to package, test, and submit your Spotify Backend app to the Umbrel Community App Store.

## Testing Locally

Before submitting your app, you should test it locally on your Umbrel device:

1. **Package the app files**:
   ```bash
   cd /home/ubuntu/spotify-backend-umbrel
   tar -czvf spotify-backend.tar.gz *
   ```

2. **Transfer to your Umbrel**:
   Use SCP or another file transfer method to copy the tar.gz file to your Umbrel device:
   ```bash
   scp spotify-backend.tar.gz umbrel@umbrel.local:~/
   ```

3. **SSH into your Umbrel**:
   ```bash
   ssh umbrel@umbrel.local
   ```

4. **Extract and install manually**:
   ```bash
   mkdir -p ~/umbrel/app-store/spotify-backend
   tar -xzvf spotify-backend.tar.gz -C ~/umbrel/app-store/spotify-backend
   cd ~/umbrel
   ./scripts/app install spotify-backend
   ```

## Submitting to the Umbrel Community App Store

To make your app available to other Umbrel users:

1. **Create a GitHub repository**:
   - Create a new repository named `umbrel-spotify-backend`
   - Upload all the files from your spotify-backend-umbrel directory

2. **Fork the Umbrel App Store repository**:
   - Go to https://github.com/getumbrel/umbrel-apps
   - Fork the repository to your GitHub account

3. **Add your app**:
   - Clone your forked repository
   - Create a new directory for your app in the `apps` directory
   - Copy your app files into this directory
   - Commit and push your changes

4. **Create a Pull Request**:
   - Go to your forked repository on GitHub
   - Click "Contribute" and "Open Pull Request"
   - Fill out the PR template with details about your app
   - Submit the PR for review

5. **Wait for review**:
   - The Umbrel team will review your app
   - They may request changes or improvements
   - Once approved, your app will be added to the Community App Store

## Installation from the App Store

Once your app is in the Umbrel Community App Store, users can install it by:

1. Going to the App Store in their Umbrel dashboard
2. Finding "Spotify Backend" in the list of available apps
3. Clicking "Install"
4. Entering their Spotify API credentials when prompted

## Updating Your App

To update your app in the future:

1. Make changes to your app files
2. Update the version number in umbrel-app.yml
3. Test the changes locally
4. Submit a new PR to the Umbrel App Store repository

## Troubleshooting

If you encounter issues during installation or submission:

- Check the Umbrel logs: `~/umbrel/logs/app-spotify-backend.log`
- Verify your app structure matches the Umbrel app requirements
- Ensure all environment variables are properly defined
- Test your app thoroughly before submission

## Resources

- [Umbrel App Store Repository](https://github.com/getumbrel/umbrel-apps)
- [Umbrel App Development Guide](https://github.com/getumbrel/umbrel-apps/blob/master/CONTRIBUTING.md)
- [Umbrel Community Forum](https://community.getumbrel.com/)
