# **App Name**: Softland Auto Updater

## Core Features:

- Service Shutdown: Automatically stops the 'Softland POS Sincronización' service before the update process begins.
- Process Termination: Closes all running processes with the name 'Softland' to prevent file access conflicts during the update.
- File Copy & Extraction: Copies the update archive (e.g., '.7z' from the network path to a local directory ('C:\Actualizacion'). Then, extracts the archive contents to the Softland installation directory ('C:\SoftlandERP'), replacing existing files.
- File Unblocking: Uses PowerShell commands to unblock the updated files within the Softland installation directory and its subdirectories (Setup, Setup\Exupgrade) to ensure proper execution.
- Module Registration Automation: Executes the 'Softland.RegistroModulos.v700.exe' program located in the Softland installation directory and automates the clicking of the 'registrar' and 'incluir' buttons. Alternatively, it might monitor the registry changes when running the exe, and simply reproduce the same changes. All with elevated administrator rights
- Configuration Management: Provides a configuration panel that allows administrators to modify critical parameters, such as file paths (source zip, destination directory), service names, admin user credentials. This information will then be used as a tool when the next upgrade cycle runs. The system should read the configs and check if each is valid.
- Logging and Reporting: Detailed logging of all actions performed during the update process, including timestamps, status, and error messages, stored locally for auditing and troubleshooting purposes.
- Idioma Español: El sistema debe ser completamente en español ya que los usuarios hablan español
- Actualización por PC: El proceso de actualización se ejecuta una por una de las PC de la empresa

## Style Guidelines:

- Primary color: Deep Blue (#1E3A8A), providing a sense of stability and trust for a system application.
- Background color: Light Gray (#F5F5F5), ensuring a clean and neutral backdrop for the interface.
- Accent color: Teal (#26A69A), used for interactive elements and key actions, providing a clear visual guide for the user.
- Body and headline font: 'Inter', a sans-serif font, known for its readability and modern, objective aesthetic.
- Clear and simple icons representing update status, configuration options, and logging functions.
- Clean and structured layout, dividing the application into logical sections for ease of use. Use of whitespace to improve readability.
- Subtle transitions and loading animations to indicate progress and system activity.