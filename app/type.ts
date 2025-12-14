export interface IPlantAnalysisData {
  is_plant: boolean;
  name: {
    text: string;
    positive: boolean | null;
  };
  place: {
    text: string;
    positive: boolean | null;
  };
  current_status_of_plant: {
    text: string;
    positive: boolean | null;
  };
  edible_parts_and_how_to_cook: {
    text: string;
    positive: boolean | null;
  };
  poisonous_parts: {
    text: string;
    positive: boolean | null;
  };
  how_to_grow_and_take_care: {
    text: string;
    positive: boolean | null;
  };
  useful_advices: {
    text: string;
    positive: boolean | null;
  };
}
