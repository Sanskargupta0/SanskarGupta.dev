import { google } from 'googleapis';
import { env } from '~/constants/env';

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  if (!env.GOOGLE_SHEETS_CLIENT_EMAIL || !env.GOOGLE_SHEETS_PRIVATE_KEY || !env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    throw new Error("Contact form requires Google Sheets configuration");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

export const appendToGoogleSheets = async (data: ContactFormData): Promise<void> => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Format date as DD-MM-YYYY h:mma
    const now = new Date();
    const pad = (n: number) => n < 10 ? `0${n}` : n;
    let hours = now.getHours();
    const minutes = pad(now.getMinutes());
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${hours}:${minutes}${ampm}`;

    const values = [
      [
        formattedDate,
        data.fullName,
        data.phone,
        data.email,
        data.message,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Contact!A:E', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw new Error('Failed to save data to Google Sheets');
  }
};

// Optional: Create headers if the sheet is empty
export const createSheetHeaders = async (): Promise<void> => {
  try {
    const sheets = getGoogleSheetsClient();
    
    const headers = [
      ['Date', 'Full Name', 'Phone', 'Email', 'Message']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A1:E1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headers,
      },
    });
  } catch (error) {
    console.error('Error creating sheet headers:', error);
    throw new Error('Failed to create sheet headers');
  }
};
