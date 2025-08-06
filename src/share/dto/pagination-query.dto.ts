// pagination-query.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'le numéro de page doit être un entier positif !' })
  @Min(1, { message: 'le numéro de page doit être un entier positif !' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'la limite doit être un entier positif !' })
  @Min(1, { message: 'la limite doit être un entier positif !' })
  limit: number = 10;
}
