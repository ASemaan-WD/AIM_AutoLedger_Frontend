/**
 * Simple script to list Files records and their status
 */

const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;

async function listFiles() {
  // Try different table name formats
  const tableNames = ['Files', 'tblWwBxYXZMcUBsHn'];
  
  for (const tableName of tableNames) {
    console.log(`\n🔍 Trying table: ${tableName}`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=5`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Response: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Records found: ${data.records.length}`);
      
      if (data.records.length > 0) {
        console.log('\n📁 Sample Records:');
        data.records.slice(0, 3).forEach((record, idx) => {
          const fields = record.fields;
          console.log(`${idx + 1}. ${record.id}`);
          console.log(`   Fields: ${Object.keys(fields).join(', ')}`);
          
          // Check for raw text field by different names
          const rawTextField = fields['Raw Text'] || fields['fldqYhVrJ09KBnVLk'] || null;
          console.log(`   Raw Text: ${rawTextField ? `${rawTextField.length} chars` : 'None'}`);
          console.log('');
        });
        break;
      }
    } else {
      console.log(`   Error: ${await response.text()}`);
    }
  }
}

listFiles().catch(console.error);
