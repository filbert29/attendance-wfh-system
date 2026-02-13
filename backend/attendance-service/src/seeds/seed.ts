import { AppDataSource } from '../data-source';
import { Employee } from '../employees/entity/employee.entity';

async function seed() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Employee);

  const existing = await repo.findOne({
    where: { name: 'Admin Employee' },
  });

  if (existing) {
    console.log('Employee already exists');
    process.exit(0);
  }

  const employee = repo.create({
    name: 'Admin Employee',
    user_id: 1,
    position_name: 'Administrator',
    created_by: 'system',
    modified_by: 'system',
  });

  await repo.save(employee);

  console.log('Employee created successfully');
  process.exit(0);
}

seed();
