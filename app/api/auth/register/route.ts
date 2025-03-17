import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import validator from 'validator';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Validate email
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: 'Неисправан формат е-поште' },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1', 
      [email]
    );

    if (userExists.rows.length > 0) {
      return NextResponse.json(
        { error: 'Е-пошта је већ регистрована' },
        { status: 409 }
      );
    }

    // Hash the password before saving to DB
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Insert new user into the database
    const result = await pool.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3) RETURNING id, email, name, role`,
      [email, hashedPassword, name || '']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key', // Make sure to set a secret in your environment variables
      { expiresIn: '1h' } // Token expiration time
    );

    // Send success response with the token
    return NextResponse.json(
      { message: 'Корисник успешно регистрован', token, user },
      { status: 201 }
    );

  } catch (error) {
    console.error('Грешка:', error);
    return NextResponse.json(
      { error: 'Дошло је до грешке на серверу' },
      { status: 500 }
    );
  }
}
