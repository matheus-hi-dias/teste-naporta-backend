import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, ...orderFields } = createOrderDto;

    const data = {
      ...orderFields,
      items: {
        create: items.map((it) => ({
          description: it.description,
          price: Number(it.price),
        })),
      },
      client: {
        create: {
          name: createOrderDto.client.name,
          document: createOrderDto.client.document,
        },
      },
      deliveryAddress: {
        create: {
          street: createOrderDto.deliveryAddress.street,
          number: createOrderDto.deliveryAddress.number,
          district: createOrderDto.deliveryAddress.district,
          complement: createOrderDto.deliveryAddress.complement,
          city: createOrderDto.deliveryAddress.city,
          state: createOrderDto.deliveryAddress.state,
          zipCode: createOrderDto.deliveryAddress.zipCode,
        },
      },
    };

    const order = await this.prismaService.order.create({
      data,
      select: {
        id: true,
        orderNumber: true,
        estimatedDeliveryDate: true,
        createdAt: true,
        client: {
          select: { name: true, document: true },
        },
        deliveryAddress: {
          select: {
            street: true,
            number: true,
            district: true,
            complement: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            price: true,
          },
        },
      },
    });

    return order;
  }

  findAll() {
    return this.prismaService.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        estimatedDeliveryDate: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            description: true,
            price: true,
          },
        },
        client: {
          select: {
            name: true,
            document: true,
          },
        },
        deliveryAddress: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        orderNumber: true,
        estimatedDeliveryDate: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            description: true,
            price: true,
          },
        },
        client: {
          select: {
            name: true,
            document: true,
          },
        },
        deliveryAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const existing = await this.prismaService.order.findUnique({
        where: { id },
        include: { items: true, client: true, deliveryAddress: true },
      });

      if (!existing) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }

      const incomingItems = updateOrderDto.items || [];

      const incomingIds = incomingItems
        .filter((it) => Boolean(it.id))
        .map((it) => it.id as string);

      const toDeleteIds = Array.isArray(existing.items)
        ? (existing.items as { id: string }[])
            .map((it) => it.id)
            .filter((existingId: string) => !incomingIds.includes(existingId))
        : [];

      const toCreate = incomingItems
        .filter((it) => !it.id)
        .map((it) => ({
          description: it.description,
          price: Number(it.price),
        }));

      const toUpdate = incomingItems
        .filter((it) => it.id)
        .map((it) => ({
          where: { id: it.id as string },
          data: {
            description: it.description,
            price: Number(it.price),
          },
        }));

      type ItemCreate = { description: string; price: number };
      type ItemUpdate = {
        where: { id: string };
        data: { description: string; price: number };
      };

      const itemsData: {
        deleteMany?: { id: { in: string[] } };
        create?: ItemCreate[];
        update?: ItemUpdate[];
      } = {};

      if (toDeleteIds.length) {
        itemsData.deleteMany = { id: { in: toDeleteIds } };
      }
      if (toCreate.length) {
        itemsData.create = toCreate;
      }
      if (toUpdate.length) {
        itemsData.update = toUpdate as ItemUpdate[];
      }

      const clientData = updateOrderDto.client
        ? {
            update: {
              name:
                updateOrderDto.client.name ??
                (existing?.client?.name as string | undefined),
              document:
                updateOrderDto.client.document ??
                (existing?.client?.document as string | undefined),
            },
          }
        : undefined;

      const deliveryAddressData = updateOrderDto.deliveryAddress
        ? {
            update: {
              street:
                updateOrderDto.deliveryAddress.street ??
                existing.deliveryAddress?.street,
              number:
                updateOrderDto.deliveryAddress.number ??
                existing.deliveryAddress?.number,
              district:
                updateOrderDto.deliveryAddress.district ??
                existing.deliveryAddress?.district,
              complement:
                updateOrderDto.deliveryAddress.complement ??
                existing.deliveryAddress?.complement,
              city:
                updateOrderDto.deliveryAddress.city ??
                existing.deliveryAddress?.city,
              state:
                updateOrderDto.deliveryAddress.state ??
                existing.deliveryAddress?.state,
              zipCode:
                updateOrderDto.deliveryAddress.zipCode ??
                existing.deliveryAddress?.zipCode,
            },
          }
        : undefined;

      const data = {
        orderNumber: updateOrderDto.orderNumber ?? existing.orderNumber,
        estimatedDeliveryDate: updateOrderDto.estimatedDeliveryDate
          ? new Date(updateOrderDto.estimatedDeliveryDate)
          : undefined,
        ...(Object.keys(itemsData).length ? { items: itemsData } : {}),
        ...(clientData ? { client: clientData } : {}),
        ...(deliveryAddressData
          ? { deliveryAddress: deliveryAddressData }
          : {}),
      } as Prisma.OrderUpdateInput;

      const updated = await this.prismaService.order.update({
        where: { id },
        data,
        include: { items: true, client: true, deliveryAddress: true },
      });

      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.order.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return 'Order deleted successfully';
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Order with ID ${id} not found.`);
      }
    }
  }
}
