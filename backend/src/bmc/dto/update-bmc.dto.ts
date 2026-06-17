import { IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateBmcDto {
  @IsOptional()
  @IsObject()
  blocks?: {
    customer_segments?: string;
    value_proposition?: string;
    channels?: string;
    customer_relations?: string;
    revenue_streams?: string;
    key_resources?: string;
    key_activities?: string;
    key_partners?: string;
    cost_structure?: string;
    environmental_impact?: string;
    social_impact?: string;
    circular_economy?: string;
    sdg_goals?: string;
  };

  @IsOptional()
  @IsBoolean()
  is_green?: boolean;
}
