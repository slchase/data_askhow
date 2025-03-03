const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for backend
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Analytics Measurement Protocol
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;

exports.handler = async function(event, context) {
  try {
    // Get the last sync timestamp from somewhere (e.g., Supabase itself)
    const lastSyncTimestamp = await getLastSyncTimestamp();
    
    // Fetch new data since last sync
    const { data: newData, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gt('created_at', lastSyncTimestamp);
      
    if (error) throw error;
    
    // Send data to Google Analytics
    for (const item of newData) {
      await sendToGA(item);
    }
    
    // Update the last sync timestamp
    await updateLastSyncTimestamp(new Date().toISOString());
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully synced ${newData.length} records` })
    };
  } catch (error) {
    console.error('Error syncing data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to sync data' })
    };
  }
};

async function getLastSyncTimestamp() {
  // Implement this to retrieve the last sync timestamp
  // Could be stored in Supabase or another persistence layer
  const { data, error } = await supabase
    .from('sync_metadata')
    .select('last_sync_timestamp')
    .single();
    
  if (error || !data) return '2000-01-01T00:00:00Z'; // Default to a past date if no record
  return data.last_sync_timestamp;
}

async function updateLastSyncTimestamp(timestamp) {
  // Implement this to update the last sync timestamp
  const { error } = await supabase
    .from('sync_metadata')
    .upsert({ id: 'supabase_ga_sync', last_sync_timestamp: timestamp });
    
  if (error) console.error('Error updating sync timestamp:', error);
}

async function sendToGA(event) {
  // Format and send the event to Google Analytics using Measurement Protocol
  const payload = {
    client_id: event.user_id || '555', // Use a consistent identifier
    events: [{
      name: event.event_name,
      params: {
        ...event.event_params,
        engagement_time_msec: 100
      }
    }]
  };

  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to send to GA: ${response.statusText}`);
  }
} 