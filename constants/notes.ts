export type NotePhoto = {
  id: string;
  uri: string;
  caption: string;
};

export type NotebookEntry = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  lastEdited: string;
  coverImage: string;
  location?: string;
  notebooks: string[];
  photos: NotePhoto[];
  checklist: { id: string; label: string; done: boolean }[];
};

export const sampleNotes: NotebookEntry[] = [
  {
    id: 'blueprint-lab',
    title: 'Prototype workshop notes',
    summary:
      'Add sketches for hinge redesign, attach measurements, and capture each foam mockup for reference.',
    tag: 'workshop',
    lastEdited: 'Today · 11:12 AM',
    coverImage:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop',
    location: 'Studio 4B',
    notebooks: ['Hardware Lab', 'Q1 Roadmap'],
    photos: [
      {
        id: 'p-1',
        uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop',
        caption: 'Sketch wall overview',
      },
      {
        id: 'p-2',
        uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop',
        caption: 'Foam mockup A',
      },
      {
        id: 'p-3',
        uri: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=900&auto=format&fit=crop',
        caption: 'Detail of hinge',
      },
    ],
    checklist: [
      { id: 'c-1', label: 'Label every photo set', done: true },
      { id: 'c-2', label: 'Upload CAD references', done: false },
      { id: 'c-3', label: 'Share recap with team', done: false },
    ],
  },
  {
    id: 'kitchen-journal',
    title: 'Recipe capture: Mediterranean table',
    summary:
      'Document plating references, pantry checklist, and wine pairings. Remember to snap each simmer stage.',
    tag: 'kitchen',
    lastEdited: 'Today · 8:45 AM',
    coverImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop',
    location: 'Test kitchen',
    notebooks: ['Cookbook Vol. 2'],
    photos: [
      {
        id: 'p-4',
        uri: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=900&auto=format&fit=crop',
        caption: 'Tapas flat lay',
      },
      {
        id: 'p-5',
        uri: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&auto=format&fit=crop',
        caption: 'Stew reduction',
      },
    ],
    checklist: [
      { id: 'c-4', label: 'Record oven temps', done: true },
      { id: 'c-5', label: 'Photo each spice mix', done: true },
      { id: 'c-6', label: 'Pairing notes', done: false },
    ],
  },
  {
    id: 'field-notes',
    title: 'Lighting study: Canyon sunrise',
    summary:
      'Need wide shots, color meter readings, and silhouette references for the short film storyboard.',
    tag: 'shoot',
    lastEdited: 'Yesterday · 9:02 PM',
    coverImage:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&auto=format&fit=crop',
    location: 'Horseshoe Bend',
    notebooks: ['Storyboards', 'Location Scouts'],
    photos: [
      {
        id: 'p-6',
        uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&auto=format&fit=crop',
        caption: 'Sunrise gradient',
      },
      {
        id: 'p-7',
        uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop',
        caption: 'Foreground rock texture',
      },
      {
        id: 'p-8',
        uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&auto=format&fit=crop',
        caption: 'Silhouette reference',
      },
      {
        id: 'p-9',
        uri: 'https://images.unsplash.com/photo-1500534314212-1e33f9c41a5b?w=900&auto=format&fit=crop',
        caption: 'Color meter readings',
      },
    ],
    checklist: [
      { id: 'c-7', label: 'Sync LUT pack', done: false },
      { id: 'c-8', label: 'Annotate exposures', done: true },
      { id: 'c-9', label: 'Upload drone stills', done: false },
    ],
  },
];

