; Script Inno Setup per GestioPro
; Prerequisito: aver eseguito "npm run electron:build" dentro la cartella frontend
;               (output in frontend\dist-electron\win-unpacked\)
;
; Per compilare:
;   - Apri questo file con Inno Setup Compiler
;   - Premi Ctrl+F9 (Build) oppure usa il menu Build > Compile
;   - L'installer viene creato in installer\Output\GestioPro_Setup_....exe
;
; Nota: l'avvio automatico con Windows NON va gestito da questo installer.
; L'app Electron si registra da sola come voce di avvio (nascosta nella tray)
; tramite app.setLoginItemSettings quando gira in versione pacchettizzata
; (vedi frontend\electron\main.js). Aggiungere qui una chiave di Run duplicherebbe
; quella registrazione.

#define AppName      "GestioPro"
#define AppVersion   "0.1.0-beta"
#define AppPublisher "DennisTurco"
#define AppURL       "https://github.com/DennisTurco/GestioPro"
#define AppExeName   "GestioPro.exe"
#define SourceDir    "..\frontend\dist-electron\win-unpacked"

[Setup]
AppId={{B8E1A6D4-2F3C-4A9B-8E5D-9A0C3F7B21D4}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
; Cartella di output dell'installer
OutputDir=Output
OutputBaseFilename={#AppName}_Setup_{#AppVersion}
SetupIconFile=..\frontend\public\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
; Solo 64-bit
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
; Richiede Windows 10+
MinVersion=10.0
; Non serve UAC per installare in AppData (user install)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\{#AppExeName}
UninstallDisplayName={#AppName} {#AppVersion}

[Languages]
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; \
  Description: "{cm:CreateDesktopIcon}"; \
  GroupDescription: "{cm:AdditionalIcons}"; \
  Flags: unchecked

[Files]
; Tutta l'app Electron impacchettata (electron-builder, target "dir"),
; incluso il backend .NET pubblicato sotto resources\backend
Source: "{#SourceDir}\*"; \
  DestDir: "{app}"; \
  Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu
Name: "{group}\{#AppName}";             Filename: "{app}\{#AppExeName}"
Name: "{group}\Disinstalla {#AppName}"; Filename: "{uninstallexe}"
; Desktop (opzionale)
Name: "{autodesktop}\{#AppName}"; \
  Filename: "{app}\{#AppExeName}"; \
  Tasks: desktopicon

[Run]
; Offre di avviare l'app dopo l'installazione
Filename: "{app}\{#AppExeName}"; \
  Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; \
  Flags: nowait postinstall skipifsilent

[UninstallRun]
; Chiude l'app e il backend prima di disinstallare (se aperti)
Filename: "taskkill.exe"; \
  Parameters: "/f /im {#AppExeName}"; \
  Flags: runhidden waituntilterminated; \
  RunOnceId: "KillApp"
Filename: "taskkill.exe"; \
  Parameters: "/f /im GestioPro.Api.exe"; \
  Flags: runhidden waituntilterminated; \
  RunOnceId: "KillBackend"
