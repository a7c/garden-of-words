import * as model from "./model";

export const STAMINA = "stamina";

export const WANDER_STA_COST = 5;
export const LUGGAGE_STA_COST = 25;
export const LUGGAGE_UNLOCK_STAMINA = 11;

export function getMeditateStaminaCost (store: model.Store): number {
	const maxStamina = store.get("resources").get(STAMINA).maxValue;
	if (maxStamina !== null) {
		return maxStamina / 2;
	}
	// shouldn't happen -- there should be a cap on max stamina
	else {
		return 10;
	}
}