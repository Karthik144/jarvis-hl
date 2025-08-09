import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Replace with your database creation
    // Check if user already exists
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    // }

    // Create new user
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     password: hashedPassword,
    //     name,
    //   },
    // });

    // Mock response for now
    const mockUser = {
      id: '1',
      email,
      name,
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: mockUser
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
