import { Router } from 'express';

const router = Router();

const posts = [
  {
    id: '1',
    username: 'testuser',
    hashtags: '#Bookstagram #CozyFantasy #AnnotatedBooks',
    caption: 'Current read with warm tea on a rainy afternoon. Loving the character dynamics in this one!',
    likes: 42,
    timeAgo: '2h',
    comments: [
      { id: 1, text: 'Wonderful cover!' },
      { id: 2, text: 'It was alright' },
      { id: 3, text: 'Adding this to my TBR list immediately!' }
    ]
  },
  {
    id: '2',
    username: 'leatherbound_pages',
    hashtags: '#VintageBooks #FirstEdition #BookCollector',
    caption: 'Stumbled upon this gorgeous 1920s leatherbound edition in an old corner bookshop today.',
    likes: 88,
    timeAgo: '4h',
    comments: [
      { id: 1, text: 'Amazing find!' },
      { id: 2, text: 'I have always wanted to visit that shop!' }
    ]
  },
  {
    id: '3',
    username: 'brews_and_bookmarks',
    hashtags: '#CoffeeAndBooks #IndieBookstore #Flatlay',
    caption: 'Morning brew alongside local indie picks. Nothing beats the smell of fresh coffee and pages.',
    likes: 19,
    timeAgo: '6h',
    comments: []
  },
  {
    id: '4',
    username: 'gothic_reads',
    hashtags: '#DarkAcademia #ThrillerReads #MoodyAesthetic',
    caption: 'Late night reading session under candlelight. Can’t put this psychological thriller down.',
    likes: 65,
    timeAgo: '1d',
    comments: [{ id: 1, text: 'What a dream!' },
      { id: 3, text: 'Adding this to my TBR list immediately!' }
    ]
  }
];

// GET /api/posts
router.get('/', (req, res) => {
  const q = req.query.q;

  if (!q || !q.toString().trim()) {
    return res.status(200).json(posts);
  }

  const searchTarget = q.toString().toLowerCase().replace(/[#@]/g, '').trim();

  const filteredPosts = posts.filter((post) => {
    const cleanHashtags = (post.hashtags || '')
      .toLowerCase()
      .replace(/[#]/g, '');

    const cleanCaption = (post.caption || '').toLowerCase();


    const cleanUsername = (post.username || '').toLowerCase().replace(/[@]/g, '');

    return (
      cleanHashtags.includes(searchTarget) ||
      cleanCaption.includes(searchTarget) ||
      cleanUsername.includes(searchTarget)
    );
  });

  return res.status(200).json(filteredPosts);
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  res.status(200).json(post);
});

// POST /api/posts/:id/comments
router.post('/:id/comments', (req, res) => {
  const { text, user } = req.body;
  const post = posts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  const newComment = { id: Date.now(), user: user || 'guest_user', text };
  post.comments.push(newComment);

  res.status(201).json({ message: 'Comment added.', comment: newComment });
});

export default router;