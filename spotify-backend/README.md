# Spotify Backend - Umbrel App

This README provides information about the Spotify Backend app for Umbrel.

## Description

Spotify Backend is an Umbrel app that provides a backend server for connecting to the Spotify API. It allows you to display your currently playing tracks and control playback through a custom widget on your Homepage dashboard.

## Features

- Authentication with Spotify API
- Retrieval of currently playing track information
- Playback controls (play, pause, next, previous)
- Designed to work with Homepage's custom API widget

## Configuration

When installing the app, you'll need to provide:

1. **Spotify Client ID**: Obtained from your Spotify Developer Dashboard
2. **Spotify Client Secret**: Obtained from your Spotify Developer Dashboard
3. **Session Secret**: A random string to secure session cookies (auto-generated)
4. **Frontend URL**: The URL of your Homepage instance (default: http://umbrel.local/homepage)

## Widget Integration

After installing this app, you can add a custom API widget to your Homepage dashboard to display and control your Spotify playback. The widget code is available in the app's documentation.

## Support

If you encounter any issues or have questions, please visit the Umbrel Community forums or open an issue on the GitHub repository.

## License

This app is open source and available under the MIT license.
