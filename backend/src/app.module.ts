import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TourDestinationsModule } from './tour-destinations/tour-destinations.module';
import { TourGuidesModule } from './tour-guides/tour-guides.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { PackagesModule } from './packages/packages.module';
import { GalleryModule } from './gallery/gallery.module';
import { HotelsModule } from './hotels/hotels.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { BlogModule } from './blog/blog.module';
import { WebsiteSettingsModule } from './website-settings/website-settings.module';
import { FaqsModule } from './faqs/faqs.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TaxisModule } from './taxis/taxis.module';
import { RolesModule } from './roles/roles.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UploadModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TourDestinationsModule,
    TourGuidesModule,
    ContactMessagesModule,
    PaymentsModule,
    AdminModule,
    PasswordResetModule,
    PackagesModule,
    GalleryModule,
    HotelsModule,
    TestimonialsModule,
    BlogModule,
    WebsiteSettingsModule,
    FaqsModule,
    BookingsModule,
    ReviewsModule,
    TaxisModule,
    RolesModule,
  ],
})
export class AppModule {}
