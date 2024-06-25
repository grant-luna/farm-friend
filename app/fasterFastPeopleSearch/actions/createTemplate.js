"use server";
import { sql } from '@vercel/postgres';
import { getSessionData } from '../../actions/getSessionData.js';

export async function createTemplate(stringifiedCategories, templateName) {
  try {
    const sessionData = await getSessionData();
    if (!sessionData) {
      throw new Error('Error accessing session data in createTemplate.js');
    }

    const userId = sessionData.userId;
    if (!userId) {
      throw new Error("Error accessing user ID in session data in createTemplate.js");
    }
  
    const categories = JSON.parse(stringifiedCategories);    
    const headers = JSON.stringify(categories.reduce((resultObject, currentCategory) => {
      resultObject[currentCategory.type] = currentCategory.headers;
      return resultObject;
    }, {}));
    

    const createTemplateResponse = await sql`
    INSERT INTO search_templates (template_name, headers, user_id)
    VALUES (${templateName}, ${headers}, ${userId})
    RETURNING template_name;
    `
    if (createTemplateResponse.rows.length !== 1) {
      throw new Error('Error inserting template into database');
    }

    return createTemplateResponse.rows[0];
    
  } catch (error) {
    console.error('Error creating template in createTemplate.js', error);
    return { error: error.message };
  }
}