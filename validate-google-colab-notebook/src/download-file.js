import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import key from '../cred/function-calling-drive-id.json' with {"type": "json"}

async function downloadFile(fileId, dest) {
    // Configure a JWT auth client
    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/drive']
    );

    // Authenticate request
    await jwtClient.authorize();

    const drive = google.drive({ version: 'v3', auth: jwtClient });

    try {
        // Get the file metadata to check for 'application/vnd.google.colaboratory'
        const res = await drive.files.get({
            fileId: fileId,
            fields: 'mimeType, name',
            supportsAllDrives: true
        });


        // Download the file
        const destPath = path.join(dest, res.data.name);

        if (destPath.length > 255) {
            throw new Error(`File path too long: ${destPath.length} characters`);
        }

        const destStream = fs.createWriteStream(destPath);

        await new Promise((resolve, reject) => {
            drive.files.get(
                { fileId: fileId, alt: 'media' },
                { responseType: 'stream' },
                function (err, res) {
                    if (err) {
                        console.error('Error during download:', err);
                        reject(err);
                        return;
                    }
                    res.data
                        .on('end', () => {
                            console.log('Download complete.');
                            resolve();
                        })
                        .on('error', err => {
                            console.error('Error downloading file:', err);
                            reject(err);
                        })
                        .pipe(destStream);
                }
            );
        });

        return destPath;
    } catch (error) {
        console.error('Failed to download file:', error);
        throw error; // Re-throw the error for further handling
    }
}

export default downloadFile;
