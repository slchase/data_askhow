// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch data from Supabase
async function fetchSupabaseData() {
  try {
    // Example: Fetch user engagement data
    const { data: userEngagement, error: userError } = await supabase
      .from('user_engagement')
      .select('*');
    
    if (userError) throw userError;
    
    // Example: Fetch question analytics
    const { data: questionAnalytics, error: questionError } = await supabase
      .from('question_analytics')
      .select('*');
    
    if (questionError) throw questionError;
    
    // Process the data
    processAnalyticsData(userEngagement, questionAnalytics);
    
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
  }
}

// Process and potentially send to Google Analytics
function processAnalyticsData(userEngagement, questionAnalytics) {
  // Example: Send custom events to Google Analytics
  if (window.gtag) {
    // Send aggregated data as custom events
    userEngagement.forEach(engagement => {
      gtag('event', 'user_engagement', {
        'user_id': engagement.user_id,
        'action_type': engagement.action_type,
        'timestamp': engagement.created_at
      });
    });
    
    // You can process and send more data as needed
  }
  
  // You could also update a local visualization here
  // or store the data for use in your dashboard
}

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', fetchSupabaseData); 