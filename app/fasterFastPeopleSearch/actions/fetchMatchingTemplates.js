"use server"
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function fetchMatchingTemplates(parsedCsvFile) {
  try {
    const sessionData = await getSessionData();
    if (!sessionData) {
      throw new Error('Error accessing session data in fetchMatchingTemplates.js');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error('Error accessing the user ID in session data in fetchMatchingTemplates.js');
    }

    const userTemplatesResponse = await sql`SELECT * FROM search_templates WHERE user_id = ${userId}`;

    const parsedCsvFileHeaders = Object.keys(parsedCsvFile[0]);    
    
    const matchingTemplates = findMatchingTemplates(parsedCsvFileHeaders, userTemplatesResponse.rows);
    return matchingTemplates;
  } catch (error) {
    console.error('Error fetching matching templates', error);
    return { error: error.message };
  }
}

function findMatchingTemplates(parsedCsvFileHeaders, userTemplates) {
  return userTemplates.filter((template) => {
    const headers = template.headers;

    return Object.keys(headers).every((categoryType) => {
      const categoryTypeSubCategories = template.headers[categoryType];      

      return Object.keys(categoryTypeSubCategories).every((subCategory) => {
        return categoryTypeSubCategories[subCategory].every((header) => parsedCsvFileHeaders.includes(header));
      });
    });
  });
}