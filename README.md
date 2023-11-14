## Settings up the development environment and running the app

For full steps follow the steps in the link https://microsoft.github.io/react-native-windows/docs/getting-started

### Summarized Steps

- Run this command: Start an elevated PowerShell window and run:

```
Set-ExecutionPolicy Unrestricted -Scope Process -Force;
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1');
```

- From the root folder of the repo run:

```
npx react-native-windows-init --overwrite
```

- From the root folder of the repo run:

```
yarn windows
```

## Installing the application on Windows 11 (Side-loading)

- Got start and search for "developer settings"
- Click on it and toggle on the "Developer Mode".
- Navigate to folder AppPackage under the root folder: `cd <repo_root>\AppPackage`
- Right click on the file "Add-AppDevPackage.ps1" and choose "Run with PowerShell"
- After the installation is completed successfully go to start and search for "checkers" and launch the application.
