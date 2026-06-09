import { Injectable, Logger } from '@nestjs/common';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(dto: SendNotificationDto) {
    // Placeholder: integrate with Twilio/SendGrid/FCM in v1
    this.logger.log(`[${dto.type}] → ${dto.recipient}: ${dto.subject}`);
    return { queued: true, type: dto.type, recipient: dto.recipient };
  }

  async sendReceiptToCustomer(transactionId: string, customerId: string) {
    this.logger.log(`Receipt queued for customer ${customerId}, tx ${transactionId}`);
    return { queued: true };
  }

  async sendAppointmentReminder(customerId: string, appointmentAt: Date) {
    this.logger.log(`Reminder queued for customer ${customerId} at ${appointmentAt}`);
    return { queued: true };
  }
}
