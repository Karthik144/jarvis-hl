import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  walletAddress: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  walletAddress: z.string().optional(),
});

// GET all users or a specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      // Get specific user
      // TODO: Replace with actual database query
      // const user = await prisma.user.findUnique({
      //   where: { id: userId },
      //   select: { id: true, email: true, name: true, walletAddress: true, createdAt: true }
      // });

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'John Doe',
        walletAddress: '0x1234...5678',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({ user: mockUser });
    } else {
      // Get all users (with pagination)
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const skip = (page - 1) * limit;

      // TODO: Replace with actual database query
      // const users = await prisma.user.findMany({
      //   skip,
      //   take: limit,
      //   select: { id: true, email: true, name: true, walletAddress: true, createdAt: true }
      // });

      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'John Doe',
          walletAddress: '0x1234...5678',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'Jane Smith',
          walletAddress: '0x8765...4321',
          createdAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        users: mockUsers,
        pagination: {
          page,
          limit,
          total: 2,
          totalPages: 1
        }
      });
    }

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// CREATE new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, walletAddress } = createUserSchema.parse(body);

    // TODO: Replace with actual database operations
    // Check if user already exists
    // const existingUser = await prisma.user.findUnique({ where: { email } });
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    // }

    // Create new user
    // const user = await prisma.user.create({
    //   data: { email, name, walletAddress },
    //   select: { id: true, email: true, name: true, walletAddress: true, createdAt: true }
    // });

    const mockUser = {
      id: Date.now().toString(),
      email,
      name,
      walletAddress,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: mockUser
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}

// UPDATE user
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = updateUserSchema.parse(body);

    // TODO: Replace with actual database update
    // const user = await prisma.user.update({
    //   where: { id: userId },
    //   data: updateData,
    //   select: { id: true, email: true, name: true, walletAddress: true, updatedAt: true }
    // });

    const mockUser = {
      id: userId,
      email: 'user@example.com',
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'User updated successfully',
      user: mockUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database deletion
    // await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
