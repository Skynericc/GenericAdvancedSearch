import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardService {

   getCardsData() {
        return [
            {
                id: '1000',
                title: 'Bamboo Watch',
                description: 'Product Description'
            },
            {
                id: '1000',
                title: 'Bamboo Watch',
                description: 'Product Description'
            }
          ];
        }
   getCards() {
    return Promise.resolve(this.getCardsData());
}

  constructor() { }
}
