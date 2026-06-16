import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create demo user
    const hashedPassword = await bcryptjs.hash('Demo@123', 10);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@bookflow.app' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'demo@bookflow.app',
        password: hashedPassword,
        name: 'Demo User',
        businessName: 'BookFlow Demo Agency',
        phone: '+1 (555) 123-4567',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
      },
    });
    console.log('✅ Demo user created:', demoUser.email);

    // 2. Create 5 sample clients
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'John Doe',
          email: 'john.doe@company.com',
          phone: '+1 (555) 201-1001',
          address: '123 Tech Street, San Francisco, CA 94105',
          notes: 'Tech Startup founder',
        },
      }),
      prisma.client.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Jane Smith',
          email: 'jane.smith@business.com',
          phone: '+1 (555) 202-2002',
          address: '456 Marketing Ave, New York, NY 10001',
          notes: 'Digital Marketing Manager',
        },
      }),
      prisma.client.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Bob Wilson',
          email: 'bob.wilson@corp.com',
          phone: '+1 (555) 203-3003',
          address: '789 Business Blvd, Chicago, IL 60601',
          notes: 'Corporate Executive',
        },
      }),
      prisma.client.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Alice Johnson',
          email: 'alice.johnson@startup.io',
          phone: '+1 (555) 204-4004',
          address: '321 Innovation Drive, Austin, TX 78701',
          notes: 'Startup Founder',
        },
      }),
      prisma.client.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Michael Brown',
          email: 'michael.brown@enterprise.com',
          phone: '+1 (555) 205-5005',
          address: '555 Corporate Way, Boston, MA 02101',
          notes: 'Enterprise Client',
        },
      }),
    ]);
    console.log(`✅ ${clients.length} sample clients created`);

    // 3. Create 4 sample services
    const services = await Promise.all([
      prisma.service.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Website Design',
          description: 'Full custom website design and development',
          price: 2500,
          duration: 120,
          category: 'Web Development',
        },
      }),
      prisma.service.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'SEO Audit',
          description: 'Comprehensive SEO analysis and recommendations',
          price: 800,
          duration: 60,
          category: 'SEO',
        },
      }),
      prisma.service.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Brand Consultation',
          description: 'Strategic brand consultation session',
          price: 500,
          duration: 45,
          category: 'Branding',
        },
      }),
      prisma.service.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          name: 'Social Media Setup',
          description: 'Social media strategy and account setup',
          price: 1200,
          duration: 90,
          category: 'Social Media',
        },
      }),
    ]);
    console.log(`✅ ${services.length} sample services created`);

    // 4. Create 8 sample bookings (last 3 months)
    const now = new Date();
    const bookings = await Promise.all([
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[0].id,
          serviceId: services[0].id,
          bookingDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          startTime: '09:00',
          endTime: '11:00',
          status: 'COMPLETED',
          totalAmount: services[0].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[1].id,
          serviceId: services[1].id,
          bookingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          startTime: '10:00',
          endTime: '11:00',
          status: 'COMPLETED',
          totalAmount: services[1].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[2].id,
          serviceId: services[2].id,
          bookingDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          startTime: '14:00',
          endTime: '14:45',
          status: 'CONFIRMED',
          totalAmount: services[2].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[3].id,
          serviceId: services[3].id,
          bookingDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          startTime: '13:00',
          endTime: '14:30',
          status: 'CONFIRMED',
          totalAmount: services[3].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[0].id,
          serviceId: services[2].id,
          bookingDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          startTime: '11:00',
          endTime: '11:45',
          status: 'PENDING',
          totalAmount: services[2].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[1].id,
          serviceId: services[1].id,
          bookingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          startTime: '09:30',
          endTime: '10:30',
          status: 'CANCELLED',
          totalAmount: services[1].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[2].id,
          serviceId: services[0].id,
          bookingDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          startTime: '10:00',
          endTime: '12:00',
          status: 'COMPLETED',
          totalAmount: services[0].price,
        },
      }),
      prisma.booking.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[4].id,
          serviceId: services[3].id,
          bookingDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          startTime: '15:00',
          endTime: '16:30',
          status: 'COMPLETED',
          totalAmount: services[3].price,
        },
      }),
    ]);
    console.log(`✅ ${bookings.length} sample bookings created`);

    // 5. Create 5 sample invoices with items
    const invoices = await Promise.all([
      prisma.invoice.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[0].id,
          invoiceNumber: 'INV-001',
          status: 'PAID',
          subtotal: 2500,
          taxRate: 0,
          taxAmount: 0,
          total: 2500,
          dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          paidDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
          notes: 'Thank you for your business!',
          items: {
            create: [
              {
                id: randomUUID(),
                description: 'Website Design - Full Site',
                quantity: 1,
                unitPrice: 2500,
                total: 2500,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[1].id,
          invoiceNumber: 'INV-002',
          status: 'PAID',
          subtotal: 1600,
          taxRate: 0,
          taxAmount: 0,
          total: 1600,
          dueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
          paidDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
          notes: '',
          items: {
            create: [
              {
                id: randomUUID(),
                description: 'SEO Audit',
                quantity: 2,
                unitPrice: 800,
                total: 1600,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[2].id,
          invoiceNumber: 'INV-003',
          status: 'SENT',
          subtotal: 1700,
          taxRate: 0,
          taxAmount: 0,
          total: 1700,
          dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
          paidDate: null,
          notes: 'Payment due within 30 days',
          items: {
            create: [
              {
                id: randomUUID(),
                description: 'Brand Consultation',
                quantity: 1,
                unitPrice: 500,
                total: 500,
              },
              {
                id: randomUUID(),
                description: 'Social Media Setup',
                quantity: 1,
                unitPrice: 1200,
                total: 1200,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[3].id,
          invoiceNumber: 'INV-004',
          status: 'DRAFT',
          subtotal: 800,
          taxRate: 0,
          taxAmount: 0,
          total: 800,
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          paidDate: null,
          notes: 'Draft invoice - not yet sent',
          items: {
            create: [
              {
                id: randomUUID(),
                description: 'SEO Audit - Consultation',
                quantity: 1,
                unitPrice: 800,
                total: 800,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          id: randomUUID(),
          userId: demoUser.id,
          clientId: clients[4].id,
          invoiceNumber: 'INV-005',
          status: 'OVERDUE',
          subtotal: 2500,
          taxRate: 0,
          taxAmount: 0,
          total: 2500,
          dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // Overdue
          paidDate: null,
          notes: 'OVERDUE - Please remit payment immediately',
          items: {
            create: [
              {
                id: randomUUID(),
                description: 'Website Design - Complete Project',
                quantity: 1,
                unitPrice: 2500,
                total: 2500,
              },
            ],
          },
        },
      }),
    ]);
    console.log(`✅ ${invoices.length} sample invoices created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`
Demo Login Credentials:
- Email: demo@bookflow.app
- Password: Demo@123

Database seeded with:
- 1 demo user
- 5 clients
- 4 services
- 8 bookings
- 5 invoices with items
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
