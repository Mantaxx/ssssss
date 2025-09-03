# strategia współczynnika pzhgp

**Prompt:**

```text
Zaimplementuj w TypeScript moduł zgodny ze wzorcem projektowym "Strategia" do obliczania współczynnika. Zdefiniuj interfejs `CalculationStrategy` z metodą `calculate(result: Result): Result`. Zaimplementuj dwie strategie:
- `StandardCoeffStrategy`: oblicza współczynnik na bazie 1:5 (20% najlepszych) z limitem 5000 gołębi.
- `GMPPointsStrategy`: przyznaje punkty ze spadkiem 20%, gdzie pierwszy gołąb otrzymuje 40 punktów.
Zapewnij pełne testy jednostkowe dla obu strategii.
```
