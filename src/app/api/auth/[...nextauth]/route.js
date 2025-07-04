import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Demo user (replace with DB lookup in production)
const users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123', // In production, use hashed passwords!
    image: '',
  },
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        if (user) {
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'supersecret',
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST }; 