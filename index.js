const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test database connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('items').select('count').single();
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Setup real-time subscription
async function setupRealtimeSubscription() {
  try {
    // Remove existing channels
    await supabase.removeAllChannels();

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          console.log('Change received!', payload);
        },
      )
      .on('connected', () => {
        console.log('Connected to realtime server');
      })
      .on('error', (error) => {
        console.error('Realtime subscription error:', error);
      })
      .on('closed', () => {
        console.log('Realtime connection closed');
      });

    channel.subscribe();

    return channel;
  } catch (error) {
    console.error('Error setting up realtime:', error);
  }
}

// Initialize connections
(async () => {
  await testConnection();
  await setupRealtimeSubscription();
})();

// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const { data, error } = await supabase.from('items').select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new item
app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  const { data, error } = await supabase
    .from('items')
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});

// PUT update item
app.put('/api/items/:id', async (req, res) => {
  const { name, description } = req.body;
  const { data, error } = await supabase
    .from('items')
    .update({ name, description })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json(data);
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
  const { error } = await supabase.from('items').delete().eq('id', req.params.id);

  if (error) throw error;
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
