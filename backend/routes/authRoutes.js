import { Router } from 'express';

const router = Router();

const users = [
  {
    id: '1',
    username: 'testuser',
    name: 'Kayla Beyers',
    pronouns: 'she/her',
    links: 'goodreads.com/testuser',
    bio: 'Capturing cozy reading nooks, annotated margins, and fantasy book aesthetics. Currently reading: The Priory of the Orange Tree 📚✨',
    avatarUrl: '',
    friends: [
      { id: '2', username: 'leatherbound_pages', name: 'Julian Vance' },
      { id: '3', username: 'brews_and_bookmarks', name: 'Aaliyah Patel' },
      { id: '4', username: 'gothic_reads', name: 'Elena Rostova' }
    ]
  },
  {
    id: '2',
    username: 'leatherbound_pages',
    name: 'Julian Vance',
    pronouns: 'he/him',
    links: 'instagram.com/leatherbound_pages',
    bio: 'Rare book collector, classic literature enthusiast, and antique bookstore photography enthusiast.',
    avatarUrl: '',
    friends: [
      { id: '1', username: 'novel_narratives', name: 'Maya Lin' }
    ]
  },
  {
    id: '3',
    username: 'brews_and_bookmarks',
    name: 'Aaliyah Patel',
    pronouns: 'they/them',
    links: 'aaliyahreads.blog',
    bio: 'Indie bookstore lover, coffee shop cozy shots, and contemporary fiction reviewer. Forever chasing the perfect flatlay.',
    avatarUrl: '',
    friends: [
      { id: '1', username: 'novel_narratives', name: 'Maya Lin' }
    ]
  },
  {
    id: '4',
    username: 'gothic_reads',
    name: 'Elena Rostova',
    pronouns: 'she/her',
    links: 'storygraph.com/elenarostova',
    bio: 'Dark academia photography, thriller recommendations, and moody candlelit bookshelf setups.',
    avatarUrl: '',
    friends: [
      { id: '1', username: 'novel_narratives', name: 'Maya Lin' }
    ]
  }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Email/Username and Password are required.' });
    }

    if (password.length < 6) {
        return res.status(401).json({ message: 'Invalid credentials. Password too short.' });
    }

    return res.status(200).json({
        message: 'Login successful!',
        token: 'stubbed-jwt-token-12345',
        user: {
            id: 1,
            username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
            email: identifier.includes('@') ? identifier : `${identifier}@example.com`
        }
    });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
    const { name, surname, email, password, confirmPassword, pronouns, username, bio, links } = req.body;

    if (!name || !surname || !email || !password || !username) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    return res.status(201).json({
        message: 'User registered successfully!',
        user: {
            id: Date.now(),
            name,
            surname,
            email,
            username,
            pronouns,
            bio,
            links
        }
    });
});

router.get('/profile/:username', (req, res) => {
  const targetUsername = req.params.username.toLowerCase();
  const user = users.find((u) => u.username.toLowerCase() === targetUsername);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
});

export default router;