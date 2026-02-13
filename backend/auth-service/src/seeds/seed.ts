import { AppDataSource } from '../data-source';
import { User } from '../users/entity/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(User);

  const existing = await repo.findOne({
    where: { email: 'admin@wfh.com' },
  });

  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = repo.create({
    email: 'admin@wfh.com',
    password: hashedPassword,
    type: 'admin',
    created_by: 'system',
    modified_by: 'system',
  });

  await repo.save(user);

  console.log('Admin user created');
  process.exit(0);
}

seed();
