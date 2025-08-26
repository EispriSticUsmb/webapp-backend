import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { lookup } from 'mime-types';
import { fileTypeFromFile } from 'file-type';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadFolder = path.resolve(
    __dirname,
    '..',
    '..',
    'storage',
  );

  constructor(private readonly prisma: PrismaService) {}

  IsValidPicture(picture: Express.Multer.File) {
    const MaxMo = 10;
    const MAX_SIZE = MaxMo * 1024 * 1024;
    if (!picture || !picture.buffer) {
      throw new BadRequestException('Fichier invalide');
    }
    if (!picture.mimetype.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }
    if (picture.size > MAX_SIZE) {
      throw new BadRequestException("L'image ne doit pas dépasser 5 Mo");
    }
  }

  async getUserProfileImagePath(
    userId: string,
  ): Promise<{ path: string; mimeType: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        profileImage: true,
      },
    });
    if (!user || !user.profileImage) return null;
    const imagePath = path.join(this.uploadFolder, 'users', user.profileImage);
    if (!fs.existsSync(imagePath)) return null;
    const mimeType = lookup(imagePath);
    if (!mimeType) return null;
    return {
      path: imagePath,
      mimeType,
    };
  }

  async getEventImagePath(
    eventId: string,
  ): Promise<{ path: string; mimeType: string } | null> {
    const Imagepath = path.join(this.uploadFolder, 'events', eventId);
    if (!fs.existsSync(Imagepath)) return null;
    const hypotheticalpathType = await fileTypeFromFile(Imagepath);
    if (!hypotheticalpathType) return null;
    const { mime } = hypotheticalpathType;
    if (!mime) return null;
    return { path: Imagepath, mimeType: mime };
  }

  async changeEventImage(eventId: string, eventImage: Express.Multer.File) {
    this.IsValidPicture(eventImage);
    const filename = eventId;
    const filepath = path.join(this.uploadFolder, '/events', filename);
    try {
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
      await fs.promises.writeFile(filepath, eventImage.buffer);
    } catch (err) {
      this.logger.log(err);
      throw new InternalServerErrorException(
        "Erreur lors de lors de l'enregistrement de l'image",
      );
    }
  }

  async deleteFile(filepath: string) {
    const filePathOnDisk = path.join(this.uploadFolder, filepath);
    try {
      if (fs.existsSync(filePathOnDisk)) {
        await fs.promises.unlink(filePathOnDisk);
      }
    } catch (err) {
      this.logger.log(err);
    }
  }

  async changeProfileImage(
    userId: string,
    profileImage: Express.Multer.File,
  ): Promise<string> {
    this.IsValidPicture(profileImage);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    const userDir = path.join(this.uploadFolder, '/users', userId);
    const filepath = path.join(userDir, `${formattedDate}.jpeg`);
    try {
      await fs.promises.mkdir(userDir, { recursive: true });
      await sharp(profileImage.buffer)
        .resize(512, 512, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toFile(filepath);
    } catch (error: unknown) {
      this.logger.log('Erreur traitement image:', error);
      throw new BadRequestException("Impossible de traiter l'image");
    }
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImage: userId + '/' + formattedDate + '.jpeg',
      },
    });
    if (user.profileImage) {
      try {
        const userStorage = path.join(
          path.resolve(__dirname, '../../storage/users'),
          user.profileImage,
        );
        await fs.promises.unlink(userStorage);
      } catch (err) {
        this.logger.log(err);
      }
    }
    return formattedDate + '.jpeg';
  }
}
