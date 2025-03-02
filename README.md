# CodeClipboardPlus

<a href="https://github.com/xAxee/CodeClipboardPlus/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/xAxee/CodeClipboardPlus.svg?logo=github&style=for-the-badge"></a>
<a href="https://github.com/xAxee/CodeClipboardPlus/releases"><img alt="Releases" src="https://img.shields.io/github/downloads/xAxee/CodeClipboardPlus/total?color=success&label=downloads&style=for-the-badge"></a>
<a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge"></a>
<br>
<a href="https://marketplace.visualstudio.com/items?itemName=HubertIwan.codeclipboardplus"><img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/HubertIwan.codeclipboardplus?style=for-the-badge&label=VS%20Marketplace%20Downloads&color=success"></a>
<a href="https://marketplace.visualstudio.com/items?itemName=HubertIwan.codeclipboardplus"><img alt="Rating" src="https://img.shields.io/visual-studio-marketplace/r/HubertIwan.codeclipboardplus?style=for-the-badge&color=gold"></a>

## 📌 Opis

**CodeClipboardPlus** to rozszerzenie dla Visual Studio Code, które umożliwia inteligentne kopiowanie struktury i zawartości plików z zaawansowanymi opcjami wykluczeń. Idealne do szybkiego udostępniania fragmentów kodu z zachowaniem kontekstu projektu.

## ✨ Funkcje

- 🔍 **Automatyczne uwzględnianie .gitignore** - pomija pliki wymienione w .gitignore
- 📃 **Konfigurowalne wykluczenia** - własne wzorce ignorowanych plików i folderów
- ⚖️ **Limit plików** - zabezpieczenie przed przypadkowym kopiowaniem dużych projektów
- 💻 **Integracja z menu kontekstowym** – dostępne opcje po kliknięciu prawym przyciskiem myszy.
- 📂 **Dwie metody kopiowania**:
  - **Z pełną strukturą** - zachowuje hierarchię katalogów i zawartość plików
  - **Tylko zawartość** - kopiuje czysty kod bez dodatkowych oznaczeń

## 🛠 Konfiguracja

Dostosuj działanie rozszerzenia przez ustawienia VSCode (`Ctrl+,`):

| Ustawienie       | Typ      | Domyślna wartość | Opis                                        |
| ---------------- | -------- | ---------------- | ------------------------------------------- |
| respectGitIgnore | boolean  | true             | Automatycznie pomija pliki z .gitignore     |
| excludePaths     | string[] | ["node_modules"] | Własne wzorce plików/folderów do pominięcia |
| filesLimit       | number   | 100              | Maksymalna liczba plików w jednej operacji  |

## 🛠 Instalacja

### Z Visual Studio Marketplace

1. Otwórz Visual Studio Code.
2. Przejdź do sekcji **Extensions** (`Ctrl+Shift+X`).
3. Wyszukaj [**CodeClipboardPlus**](https://marketplace.visualstudio.com/items?itemName=HubertIwan.codeclipboardplus) i kliknij **Install**.

### Ręczna instalacja z pliku `.vsix`

1. Pobierz `.vsix` z [releases](https://github.com/xAxee/CodeClipboardPlus/releases).
2. Otwórz Visual Studio Code i przejdź do **Extensions**.
3. Kliknij ikonę `...` i wybierz **Install from VSIX...**.
4. Wskaż pobrany plik `.vsix`.

## 🚀 Jak używać?

1. Otwórz **Explorer** w Visual Studio Code.
2. Kliknij **prawym przyciskiem myszy** na wybrany plik, folder lub grupę plików.
3. Wybierz jedną z dostępnych opcji:
   - **Copy Files Content with Structure** – skopiuje strukturę i zawartość plików.
   - **Copy Files Content Only** – skopiuje tylko treść plików.
4. Wklej skopiowany kod (`Ctrl+V`) w dowolnym miejscu.

## 📌 Przykłady użycia

Dla folderu zawierającego następujące pliki:

```
ProjectRoot/
  ├── main.py
  ├── utils/
  │   ├── helpers.py
  │   ├── constants.py
```

Wynik kopiowania z **Copy Files Content with Structure**:

```py
### PROJECT STRUCTURE START ###
[ProjectRoot]
- [FILE] main.py
- [FOLDER] utils/
- [FILE] utils/helpers.py
- [FILE] utils/constants.py
### PROJECT STRUCTURE END ###

### FILE START: main.py ###
print("Hello, World!")
### FILE END: main.py ###

### FILE START: utils/helpers.py ###
def greet(name):
    return f"Hello, {name}!"
### FILE END: utils/helpers.py ###

### FILE START: utils/constants.py ###
PI = 3.14159
### FILE END: utils/constants.py ###
```

Wynik kopiowania z **Copy Files Content Only**:

```py
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

PI = 3.14159
```

## Wymagania

- Visual Studio Code **v1.60.0** lub nowszy.
- System operacyjny Windows, macOS lub Linux.

## Wkład i rozwój

Chcesz pomóc w rozwoju? 💡

- Zgłaszaj błędy i sugestie w [GitHub Issues](https://github.com/xAxee/CodeClipboardPlus/issues).
- Forkuj repozytorium i twórz pull requesty.

## Licencja

Projekt jest udostępniany na licencji **MIT**, co oznacza, że możesz go dowolnie używać i modyfikować.

---

Dziękuje za korzystanie z **CodeClipboardPlus**! 🚀
