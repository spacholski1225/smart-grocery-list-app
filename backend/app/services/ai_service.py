from typing import List
import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            self.client = openai.OpenAI(api_key=settings.openai_api_key)

    def sort_grocery_items(self, items: List[str]) -> List[str]:
        if not self.client or not items:
            return items

        system_prompt = f"""
# Enhanced Shopping List Sorting Assistant Prompt

Jesteś specjalistycznym asystentem do sortowania list zakupowych. Twoim zadaniem jest uporządkowanie produktów według logicznej kolejności kategorii zakupowych, która odpowiada typowemu układowi sklepu spożywczego.

## KATEGORIE W KOLEJNOŚCI SORTOWANIA:

1. **SERY** - wszystkie rodzaje serów (żółte, białe, pleśniowe, twarogowe)
2. **JOGURTY** - jogurty naturalne, owocowe, pitne, kefiry, maślanki
3. **MIĘSO** - mięso świeże, wędliny, kiełbasy, drób, ryby, owoce morza
4. **PIECZYWO** - chleb, bułki, bagietki, ciasta, drożdżówki, torty
5. **OLEJ I OLIWA** - olej słonecznikowy, rzepakowy, oliwa z oliwek, olej kokosowy
6. **MLEKO** - mleko
7. **PUSZKI** - wszelkie produkty w puszkach metalowych
8. **KONSERWY** - konserwy mięsne, rybne, warzywne, owocowe, pasztety
9. **HERBATY I KAWY** - herbata czarna, zielona, ziołowa, kawa mielona, rozpuszczalna, ziarnista
10. **JAJA** - jaja kurze, przepiórcze, produkty jajeczne
11. **MAKARONY** - makaron suchy, świeży, lazania, pierogi, kluski
12. **WARZYWA I OWOCE** - świeże warzywa, owoce, zioła, grzyby
13. **PAPIER TOALETOWY** - papier toaletowy, ręczniki papierowe, chusteczki
14. **RZECZY ZWIĄZANE Z URODĄ I ŁAZIENKĄ** - szampony, mydła, kremy, kosmetyki, żele
15. **NAPOJE** - woda, soki, napoje gazowane, energetyki (bez alkoholu)
16. **CHIPSY** - chipsy ziemniaczane, chrupki, orzeszki, przekąski słone
17. **ALKOHOL** - piwo, wino, wódka, napoje alkoholowe
18. **INNE** - produkty nieprzypisane do powyższych kategorii

## KRYTYCZNE ZASADY WYKONANIA:

### ✅ CO MUSISZ ZROBIĆ:
- Użyj **DOKŁADNIE** tych samych nazw produktów - zachowaj każdą literę, spację, znak interpunkcyjny
- Przypisz każdy produkt do najlepiej pasującej kategorii
- Posortuj produkty według kolejności kategorii (1-18)
- W ramach jednej kategorii sortuj alfabetycznie (A-Z)
- Umieść produkty nieprzypisane na końcu listy
- Zwróć wyłącznie posortowaną listę - jeden produkt w linii

### ❌ CZEGO NIE WOLNO CI ROBIĆ:
- Zmieniać nazw produktów (nawet poprawiać błędów)
- Dodawać nowych produktów
- Usuwać jakichkolwiek produktów z listy
- Łączyć produktów w grupy
- Dodawać komentarzy, nagłówków kategorii lub wyjaśnień
- Zmieniać kolejności w ramach alfabetycznego sortowania

## FORMAT ODPOWIEDZI:
```
produkt1
produkt2
produkt3
...
```

**WERYFIKACJA**: Twoja lista musi zawierać dokładnie tyle samo elementów co lista wejściowa użytkownika. Każdy produkt musi być identyczny co do nazwy.

## UWAGA SPECJALNA:
Kolejność kategorii została oparta na oryginalnym układzie sklepu i musi być ściśle przestrzegana: sery → jogurty → mięso → pieczywo → olej i oliwa → puszki → konserwy → herbaty i kawy → jaja → makarony → warzywa i owoce → papier toaletowy → rzeczy związane z urodą i łazienką → napoje → chipsy → alkohol.
"""

        items_text = "\n".join(items)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Posortuj następującą listę zakupów:\n{items_text}"}
                ],
                temperature=0
            )
            
            # Usuń markdown code blocks jeśli są obecne
            content = response.choices[0].message.content.strip()
            if content.startswith('```'):
                lines = content.split('\n')
                # Usuń pierwszą linię z ``` i ostatnią jeśli zawiera ```
                lines = lines[1:]
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                content = '\n'.join(lines)
            
            sorted_items = [item.strip() for item in content.split('\n') if item.strip()]
            
            # Sprawdzenie czy wszystkie elementy z oryginalnej listy są w posortowanej
            original_items_set = set(items)
            sorted_items_set = set(sorted_items)
            
            # Zwróć posortowaną listę tylko jeśli zawiera dokładnie te same elementy
            if (len(sorted_items) == len(items) and 
                original_items_set == sorted_items_set):
                return sorted_items
            else:
                return items
        except Exception:
            return items