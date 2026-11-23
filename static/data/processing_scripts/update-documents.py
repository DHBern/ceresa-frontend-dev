#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build documents.json (type TDocuments) from a 4-sheet spreadsheet + old_documents.json.

Sheets:
    "Testi editi"      -> documents.published
    "Testi inediti"    -> documents.unpublished
    "Testi postumi"    -> documents.posthum
    "Testi dizionario" -> routed per row by "Stato di pubblicazione (version)":
                          "inedito" -> unpublished, "postumo" -> posthum

Row filter: only rows whose "Included in final version" is sì/si/TRUE/true are converted.

Conventions:
    - all document keys are prefixed with their section:
      documents.posthum = { "posthum_<identifier>[_<suffix>]": {...} };
      the same prefixed key is used for slug;
      tei.version_id and tei.filename are the unprefixed identifier (no section prefix, no suffix)
    - metadata.type_genre     in 'in_periodico'|'in_volume'|'in_giornale'|'manoscritto'|'dattiloscritto'
    - metadata.type_editorial in 'saggio'|'prosa'|'racconto'|'traduzione'|'dizionario'|'poesia'|'romanzo'|'teatrale'
    - missing data (missing column, empty cell, "-") is written as null (= TUnset), never ""

Also produced:
    - TPosthumKeys.ts / TUnpublishedKeys.ts / TPublishedKeys.ts (next to output)
    - documents_conversion_warnings.log (all warnings of the run)

Usage:
    python3 convert_spreadsheet.py --xlsx data.xlsx --old old_documents.json --out documents.json
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("This script requires openpyxl:  pip install openpyxl")

# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------

MISSING_VALUES = {None, "", "-"}
UNSET = None                                   # written to JSON as null (= TUnset)

#: values accepted in "Included in final version" (compared lower-cased)
FINAL_VERSION_ACCEPT = {"sì", "si", "true", "yes"}

#: fields split on newline AND comma (IDs, filenames, URLs, keywords, group ids)
SPLIT_NEWLINE_COMMA = {
    "metadata.keywords",
    "archival.url_online_sources",
    "crossReferences.group_ids",
    "crossReferences.linked_documents_raw",
    "transcribus.tif_files_to_edit",
}

#: prose fields where commas are part of the text -> split on newline only
SPLIT_NEWLINE_ONLY = {
    "publication.other_editions",
    "publication.other_translations",
}

SCALAR_FIELDS = {
    "metadata.title_editorial",
    "metadata.language",
    "metadata.observations",
    "archival.archive",
    "archival.signature",
    "archival.url_helvetic_archives",
    "document.type_material",
    "document.title_on_document",
    "document.date_and_place_author_as_on_document",
    "document.date_author_normalised",
    "iiif.url_IIIF_manifest",
    "publication.pub_type",
    "publication.pub_date",
    "publication.pub_place",
    "publication.pub_info",
    "transcribus.filename_first_facsimile",
    "transcribus.filename_last_facsimile",
}

INT_FIELDS = {"archival.digitalisation_number"}

#: controlled vocabulary, normalized (lower-cased) spreadsheet value -> canonical key
TYPE_EDTYPE = {                                # -> metadata.type_genre (TDocEdtypeKeys)
    "in periodico": "in_periodico",
    "in volume": "in_volume",
    "in giornale": "in_giornale",
    "manoscritto": "manoscritto",
    "dattiloscritto": "dattiloscritto",
    "in_periodico": "in_periodico",
    "in_volume": "in_volume",
    "in_giornale": "in_giornale",
}
TYPE_GENRE = {                                 # -> metadata.type_editorial (TDocGenreKeys)
    "saggio o intervento": "saggio",
    "saggio": "saggio",
    "altra prosa": "prosa",
    "prosa": "prosa",
    "racconto": "racconto",
    "traduzione": "traduzione",
    "dizionario": "dizionario",
    "poesia": "poesia",
    "romanzo": "romanzo",
    "testo teatrale": "teatrale",
    "teatrale": "teatrale",
}
TYPE_VALUE_MAP = {**TYPE_EDTYPE, **TYPE_GENRE}
TYPE_FIELD_TARGETS = {
    "metadata.type_genre": set(TYPE_EDTYPE.values()),
    "metadata.type_editorial": set(TYPE_GENRE.values()),
}

SECTION_TYPE_NAMES = {
    "posthum": "TPosthumKeys",
    "unpublished": "TUnpublishedKeys",
    "published": "TPublishedKeys",
}

SECTION_PREFIX = {s: f"{s}_" for s in SECTION_TYPE_NAMES}
PREFIXES_TO_STRIP = ("posthum_", "unpublished_", "published_",
                     "postumo_", "inedito_", "edito_")

SHEET_NAMES = {
    "editi": "Testi editi",
    "inediti": "Testi inediti",
    "postumi": "Testi postumi",
    "dizionario": "Testi dizionario",
}

ROUTING_BY_PUBTYPE = {"inedito": "unpublished", "postumo": "posthum"}

# --------------------------------------------------------------------------
# Per-sheet configuration
# --------------------------------------------------------------------------
# Each entry maps a JSON path -> expected column header.
# A value of None means the column is marked "[missing]" in the spreadsheet:
# the script accepts its absence silently (the field stays TUnset).

def _cfg(identifier, suffix, type_editorial, material, date_place, date_norm,
         pub_date, pub_place, pub_info, other_editions, translations):
    return {
        "identifier": identifier,
        "suffix": suffix,                      # None = "[missing]"
        "included": "Included in final version",
        "fields": {
            "metadata.type_genre": "Tipologia testuale",
            "metadata.type_editorial": type_editorial,
            "metadata.title_editorial": "Titolo editoriale",
            "metadata.language": "Lingua",
            "metadata.keywords": "Parole chiave",
            "metadata.observations": "Osservazioni",
            "archival.archive": "Fondo archivistico/biblioteca",
            "archival.signature": "Segnatura",
            "archival.digitalisation_number": "Numero digitalizzazioni",
            "archival.url_helvetic_archives": "Link helveticarchives",
            "archival.url_online_sources": "Link a risorse online",
            "document.type_material": material,
            "document.title_on_document": "Titolo presente sul documento",
            "document.date_and_place_author_as_on_document": date_place,
            "document.date_author_normalised": date_norm,
            "iiif.url_IIIF_manifest": "IIIF Manifest",
            "crossReferences.linked_documents_raw": "Documenti collegati (ID)",
            "crossReferences.group_ids": "Identifier gruppo",
            "publication.pub_type": "Stato di pubblicazione (version)",
            "publication.pub_date": pub_date,
            "publication.pub_place": pub_place,
            "publication.pub_info": pub_info,
            "publication.other_editions": other_editions,
            "publication.other_translations": translations,
            "transcribus.tif_files_to_edit": "Files da editare",
            "transcribus.filename_first_facsimile": "Filename primo facsimile",
            "transcribus.filename_last_facsimile": "Filename ultimo facsimile",
        },
    }


SHEET_CONFIG = {
    SHEET_NAMES["editi"]: _cfg(
        identifier="Identifier editi",
        suffix=None,
        type_editorial="Tipologia editoriale",
        material="Informazioni materiali sul testimone (originale/fotocopia, ev. corr. ms.)",
        date_place=None,
        date_norm=None,
        pub_date="Data di pubblicazione (aaaa-mm-dd)",
        pub_place="Sede di pubblicazione",
        pub_info="Altre informazioni (ev. numero, annata, serie, rubrica, collana, pagine)",
        other_editions="Altre edizioni del testo",
        translations="Traduzioni: titolo, autore/autrice e lingua originale; ev. edizione di riferimento",
    ),
    SHEET_NAMES["postumi"]: _cfg(
        identifier="Identifier postumi",
        suffix=None,
        type_editorial="Tipologia del documento",
        material=("Informazioni materiali sul testimone (originale, fotocopia, copia carbone, "
                  "ecc.; num. ff. ds/ms. recto e verso; ev. interventi ms.)"),
        date_place="data e luogo d'autrice",
        date_norm="Datazione d'autrice normalizzata (aaaa-mm-dd)",
        pub_date=None,
        pub_place=None,
        pub_info=None,
        other_editions="Edizioni del testo",
        translations="Traduzioni: titolo, autore/autrice e lingua originale; ev. edizione di riferimento",
    ),
    SHEET_NAMES["inediti"]: _cfg(
        identifier="Identifier inediti",
        suffix=None,
        type_editorial="Tipologia del documento",
        material=("Informazioni materiali sul testimone (originale, fotocopia, copia carbone, "
                  "ecc.; num. ff. ds/ms. recto e verso; con/senza interventi ms.)"),
        date_place="Data e luogo d'autrice",
        date_norm="Datazione d'autrice normalizzata (aaaa-mm-dd)",
        pub_date=None,
        pub_place=None,
        pub_info=None,
        other_editions=None,
        translations="Traduzioni: autore/autrice, titolo, lingua originale; ev. edizione di riferimento",
    ),
    SHEET_NAMES["dizionario"]: _cfg(
        identifier="Identifier",
        suffix="suffix_version",
        type_editorial="Tipologia del documento",
        material=("Informazioni materiali sul testimone (originale, fotocopia, copia carbone, "
                  "ecc.; num. ff. ds/ms. recto e verso; ev. interventi ms.)"),
        date_place="Data e luogo d'autrice",
        date_norm="Datazione d'autrice normalizzata (aaaa-mm-dd)",
        pub_date=None,
        pub_place=None,
        pub_info=None,
        other_editions="Edizioni del testo",
        translations="Traduzioni: titolo, autore/autrice e lingua originale; ev. edizione di riferimento",
    ),
}

SHEET_SECTION = {
    SHEET_NAMES["editi"]: "published",
    SHEET_NAMES["inediti"]: "unpublished",
    SHEET_NAMES["postumi"]: "posthum",
    SHEET_NAMES["dizionario"]: None,           # routed per row via publication.pub_type
}

# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


def normalize_header(h: str) -> str:
    """Normalize a header for tolerant comparison."""
    return re.sub(r"\s+", " ", h.replace("’", "'")).strip().lower()


def cell_str(value) -> str | None:
    """Return a trimmed string, or None when the cell counts as missing."""
    if value is None:
        return None
    s = str(value).strip()
    return None if s in MISSING_VALUES else s


def is_final_version(value) -> bool:
    """True when 'Included in final version' counts as yes."""
    s = cell_str(value)
    if s is None:
        return False
    return s.lower() in FINAL_VERSION_ACCEPT


def split_field(path: str, raw: str) -> list[str]:
    """Split a multi-valued cell according to the field's separator rules."""
    if path in SPLIT_NEWLINE_COMMA:
        parts = re.split(r"[,\n]", raw)
    elif path in SPLIT_NEWLINE_ONLY:
        parts = re.split(r"\n+", raw)
    else:
        parts = [raw]
    return [p.strip() for p in parts if p.strip() and p.strip() not in MISSING_VALUES]


def strip_prefix(token: str) -> list[str]:
    """Return the token plus all prefix-stripped variants (longest prefix first)."""
    variants = [token]
    for pfx in PREFIXES_TO_STRIP:
        if token.startswith(pfx):
            variants.append(token[len(pfx):])
    return variants


# --------------------------------------------------------------------------
# Converter
# --------------------------------------------------------------------------


class Converter:
    def __init__(self, xlsx_path: Path, old_path: Path, out_path: Path):
        self.xlsx_path = xlsx_path
        self.old_path = old_path
        self.out_path = out_path
        self.warnings: list[str] = []
        self.errors: list[str] = []
        # section -> {key: record}   (records use flat "a.b" paths)
        self.documents: dict[str, dict[str, dict]] = {
            "posthum": {}, "unpublished": {}, "published": {},
        }
        # registries for cross-reference resolution
        self.key_registry: dict[str, str] = {}        # full key -> section
        self.id_registry: dict[str, list[str]] = {}   # identifier -> [full keys]
        # old_documents.json index: tei.filename -> iiif_urls
        self.iiif_index: dict[str, list[str]] = {}
        # old_documents.json index: tei.filename -> crossReferences.cited_entities
        self.cited_entities_index: dict[str, dict] = {}
        # old_documents.json index: tei.filename -> crossReferences.linked_entities
        self.linked_entities_index: dict[str, dict] = {}

    # ---------------- logging ----------------

    def warn(self, msg: str):
        self.warnings.append(msg)

    def error(self, msg: str):
        self.errors.append(msg)

    # ---------------- old_documents.json ----------------

    def load_old(self):
        try:
            with self.old_path.open(encoding="utf-8") as fh:
                old = json.load(fh)
        except Exception as exc:                                # noqa: BLE001
            self.error(f"Cannot read old file '{self.old_path}': {exc}")
            return
        docs = old.get("documents", {}) if isinstance(old, dict) else {}
        for section, entries in docs.items():
            if not isinstance(entries, dict):
                continue
            for key, entry in entries.items():
                if not isinstance(entry, dict):
                    continue
                fname = ((entry.get("tei") or {}).get("filename")) or key
                urls = (entry.get("manuscript") or {}).get("iiif_urls")
                if isinstance(urls, list) and urls:
                    if fname in self.iiif_index:
                        self.warn(
                            f"old_documents.json: duplicate tei.filename '{fname}' "
                            f"(section '{section}'); keeping first occurrence.")
                    else:
                        self.iiif_index[fname] = urls
                xref = entry.get("crossReferences") or {}
                cited = xref.get("cited_entities")
                if isinstance(cited, dict):
                    if fname in self.cited_entities_index:
                        self.warn(
                            f"old_documents.json: duplicate crossReferences.cited_entities "
                            f"for tei.filename '{fname}' (section '{section}'); "
                            f"keeping first occurrence.")
                    else:
                        self.cited_entities_index[fname] = cited
                linked = xref.get("linked_entities")
                if isinstance(linked, dict):
                    if fname in self.linked_entities_index:
                        self.warn(
                            f"old_documents.json: duplicate crossReferences.linked_entities "
                            f"for tei.filename '{fname}' (section '{section}'); "
                            f"keeping first occurrence.")
                    else:
                        self.linked_entities_index[fname] = linked

    def _lookup_in_index(self, index: dict, identifier: str, key: str):
        """Look up identifier/key (and stripped variants) in an old-document index."""
        candidates: list[str] = []
        for token in (key, identifier):
            for variant in strip_prefix(token):
                if variant not in candidates:
                    candidates.append(variant)
        for cand in candidates:
            if cand in index:
                return index[cand]
        return None

    def iiif_for(self, identifier: str, key: str) -> list[str] | None:
        return self._lookup_in_index(self.iiif_index, identifier, key)

    def cited_entities_for(self, identifier: str, key: str) -> dict | None:
        return self._lookup_in_index(self.cited_entities_index, identifier, key)

    def linked_entities_for(self, identifier: str, key: str) -> dict | None:
        return self._lookup_in_index(self.linked_entities_index, identifier, key)

    # ---------------- spreadsheet ----------------

    def header_index(self, sheet_name: str, headers_row) -> tuple[dict[str, int], dict[str, int]]:
        """Exact and normalized header -> column index maps; duplicates are fatal."""
        exact: dict[str, int] = {}
        norm: dict[str, int] = {}
        for idx, raw in enumerate(headers_row):
            h = cell_str(raw)
            if h is None:
                continue
            if h in exact:
                self.error(
                    f"Sheet '{sheet_name}': duplicate header '{h}' in columns "
                    f"{exact[h] + 1} and {idx + 1}. Cannot proceed reliably.")
            exact[h] = idx
            norm.setdefault(normalize_header(h), idx)
        return exact, norm

    def find_column(self, sheet_name: str, wanted: str,
                    exact: dict[str, int], norm: dict[str, int]) -> int | None:
        if wanted in exact:
            return exact[wanted]
        nwanted = normalize_header(wanted)
        if nwanted in norm:
            found = next(k for k, v in norm.items() if v == norm[nwanted])
            self.warn(
                f"Sheet '{sheet_name}': header matched only after normalization: "
                f"expected '{wanted}', found '{found}'.")
            return norm[nwanted]
        suggestions = difflib.get_close_matches(wanted, list(exact), n=3, cutoff=0.6)
        hint = f" Closest existing headers: {suggestions}." if suggestions else ""
        self.error(
            f"Sheet '{sheet_name}': required header '{wanted}' not found.{hint}")
        return None

    def parse_sheet(self, sheet_name: str, wb):
        if sheet_name not in wb.sheetnames:
            self.error(f"Workbook has no sheet '{sheet_name}'. "
                       f"Available: {wb.sheetnames}")
            return
        ws = wb[sheet_name]
        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 1:
            self.error(f"Sheet '{sheet_name}' is empty.")
            return
        exact, norm = self.header_index(sheet_name, rows[0])

        cfg = SHEET_CONFIG[sheet_name]
        col_id = self.find_column(sheet_name, cfg["identifier"], exact, norm)
        col_suffix = (self.find_column(sheet_name, cfg["suffix"], exact, norm)
                      if cfg["suffix"] else None)
        col_included = self.find_column(sheet_name, cfg["included"], exact, norm)
        columns: dict[str, int | None] = {}
        for path, header in cfg["fields"].items():
            if header is None:                     # "[missing]" -> optional column
                columns[path] = None
                continue
            columns[path] = self.find_column(sheet_name, header, exact, norm)
        if col_id is None or col_included is None:
            return                                 # error already recorded

        skipped_not_final = 0
        for rno, row in enumerate(rows[1:], start=2):
            ident = cell_str(row[col_id])
            if ident is None:
                continue                           # completely empty row
            if not is_final_version(row[col_included]):
                skipped_not_final += 1
                continue
            suffix = cell_str(row[col_suffix]) if col_suffix is not None else None

            # ---- collect field values (uniform shape, missing -> UNSET) ----
            rec: dict = {path: UNSET for path in cfg["fields"]}
            for path, col in columns.items():
                if col is None:
                    continue                       # column missing -> stays TUnset
                raw = cell_str(row[col])
                if raw is None:
                    continue                       # empty cell or "-" -> TUnset
                if path in INT_FIELDS:
                    try:
                        rec[path] = int(float(raw))
                    except ValueError:
                        self.warn(
                            f"Sheet '{sheet_name}' row {rno}: '{path}' value "
                            f"'{raw}' is not a number -> set to TUnset.")
                    continue
                if path in TYPE_FIELD_TARGETS:     # vocabulary conversion
                    converted = TYPE_VALUE_MAP.get(raw.lower())
                    if converted is None:
                        allowed = sorted(TYPE_FIELD_TARGETS[path])
                        self.warn(
                            f"Sheet '{sheet_name}' row {rno}: '{path}' value "
                            f"'{raw}' not in vocabulary {allowed} -> kept verbatim.")
                        rec[path] = raw
                    else:
                        rec[path] = converted
                elif path in SCALAR_FIELDS:
                    rec[path] = raw
                else:
                    values = split_field(path, raw)
                    if values:
                        rec[path] = values         # else stays TUnset

            # ---- normalize pub_type and route the row ----
            pub_type = rec.get("publication.pub_type")
            if isinstance(pub_type, str):
                rec["publication.pub_type"] = pub_type.lower()

            section = SHEET_SECTION[sheet_name]
            if section is None:                    # dizionario: route per row
                pt = rec.get("publication.pub_type")
                section = ROUTING_BY_PUBTYPE.get(pt) if isinstance(pt, str) else None
                if section is None:
                    self.warn(
                        f"Sheet '{sheet_name}' row {rno} (identifier '{ident}'): "
                        f"cannot route row, 'Stato di pubblicazione (version)' is "
                        f"'{pub_type}' but expected 'inedito' or 'postumo'. Row skipped.")
                    continue

            # ---- build the prefixed key ----
            key = f"{SECTION_PREFIX[section]}{ident}"
            if suffix:
                key = f"{key}_{suffix}"
            if key in self.key_registry:
                self.error(
                    f"Sheet '{sheet_name}' row {rno}: duplicate key '{key}' "
                    f"(already defined). This row is skipped.")
                continue

            # ---- finalize record ----
            rec["slug"] = key
            rec["tei.version_id"] = ident
            rec["tei.filename"] = ident
            rec["tei.suffix_version"] = suffix if suffix else UNSET

            dn = rec.get("document.date_author_normalised")
            rec["metadata.date"] = {"from": dn if isinstance(dn, str) else UNSET,
                                    "to": dn if isinstance(dn, str) else UNSET}
            if not isinstance(dn, str):
                self.warn(
                    f"Sheet '{sheet_name}' row {rno} (identifier '{ident}'): no "
                    f"'Datazione d'autrice normalizzata' -> metadata.date set to TUnset.")

            urls = self.iiif_for(ident, key)
            preview = (urls[0] if urls and urls[0]
                       else rec.get("transcribus.filename_first_facsimile"))
            if preview and not re.match(r"^https?://", preview, re.IGNORECASE) \
                    and not preview.lower().endswith(".tif"):
                preview += ".tif"
            rec["iiif.filename_or_url_preview"] = preview
            if preview is None:
                self.warn(
                    f"Sheet '{sheet_name}' row {rno} (identifier '{ident}'): no first "
                    f"facsimile in old_documents.json or Transcribus -> "
                    f"iiif.filename_or_url_preview set to TUnset.")

            cited = self.cited_entities_for(ident, key)
            if cited is not None:
                rec["crossReferences.cited_entities"] = cited

            linked = self.linked_entities_for(ident, key)
            if linked is not None:
                rec["crossReferences.linked_entities"] = linked

            rec["_row"] = (sheet_name, rno, ident)
            self.documents[section][key] = rec
            self.key_registry[key] = section
            self.id_registry.setdefault(ident, []).append(key)

        if skipped_not_final:
            self.warn(
                f"Sheet '{sheet_name}': {skipped_not_final} row(s) skipped because "
                f"'Included in final version' is not sì/si/TRUE/true.")

    # ---------------- cross references ----------------

    def resolve_linked_documents(self):
        for section, docs in self.documents.items():
            for key, rec in docs.items():
                raw_ids = rec.get("crossReferences.linked_documents_raw")
                if not isinstance(raw_ids, list):
                    rec.pop("crossReferences.linked_documents_raw", None)
                    continue
                sheet, rno, ident = rec["_row"]
                linked: dict[str, list[str]] = {}
                for raw in raw_ids:
                    matches: list[str] = []
                    for cand in strip_prefix(raw):
                        if cand in self.key_registry:
                            matches.append(cand)
                        elif cand in self.id_registry:
                            if len(self.id_registry[cand]) > 1:
                                self.warn(
                                    f"Sheet '{sheet}' row {rno} ({ident}): linked ID "
                                    f"'{raw}' is ambiguous ({self.id_registry[cand]}); "
                                    f"taking first match.")
                            matches.append(self.id_registry[cand][0])
                        if matches:
                            break
                    if not matches:
                        self.warn(
                            f"Sheet '{sheet}' row {rno} ({ident}): linked document ID "
                            f"'{raw}' could not be resolved to any parsed row -> dropped.")
                        continue
                    tgt_key = matches[0]           # already section-prefixed
                    tgt_section = self.key_registry[tgt_key]
                    bucket = linked.setdefault(tgt_section, [])
                    if tgt_key not in bucket:
                        bucket.append(tgt_key)
                rec.pop("crossReferences.linked_documents_raw", None)
                if linked:
                    rec["crossReferences.linked_documents"] = linked

    # ---------------- assembly & output ----------------

    @staticmethod
    def nest(rec: dict) -> dict:
        """Turn 'a.b' flat keys into nested objects; drop bookkeeping keys."""
        out: dict = {}
        for path, value in rec.items():
            if path == "_row":
                continue
            parts = path.split(".")
            node = out
            for part in parts[:-1]:
                node = node.setdefault(part, {})
            node[parts[-1]] = value
        return out

    def meta_block(self) -> dict:
        now = datetime.now(timezone.utc)
        return {
            "generated_by": "convert_spreadsheet.py",
            "task": ("Convert data.xlsx (4 sheets) + old_documents.json into "
                     "documents.json (type TDocuments); audio left empty."),
            "generated_on": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "description": (
                f"Sources: spreadsheet '{self.xlsx_path.name}' "
                f"(sheets: {', '.join(SHEET_CONFIG)}); "
                f"First facsimiles from '{self.old_path.name}' or the spreadsheet; "
                f"crossReferences.cited_entities and "
                f"crossReferences.linked_entities from '{self.old_path.name}' "
                f"(matched via tei.filename). Only rows with 'Included in final "
                f"version' = sì/si/TRUE were converted. Run on "
                f"{now.strftime('%Y-%m-%d')}. All document keys and slugs are prefixed "
                f"with their section (posthum_/unpublished_/published_); "
                f"tei.version_id and tei.filename are the unprefixed identifier "
                f"(no section prefix, no suffix). Missing data is null (TUnset)."
            ),
        }

    def write_ts_files(self, ts_dir: Path):
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        for section, type_name in SECTION_TYPE_NAMES.items():
            keys = sorted(self.documents[section])
            body = "\n".join(f"\t| '{k}'" for k in keys) if keys else "\t| (string & {})"
            text = (
                f"// Auto-generated by convert_spreadsheet.py on {stamp}\n"
                f"// from '{self.xlsx_path.name}' — do not edit manually.\n"
                f"export type {type_name} =\n{body};\n"
            )
            (ts_dir / f"{type_name}.ts").write_text(text, encoding="utf-8")

    def flush_report(self):
        log_path = self.out_path.with_name("documents_conversion_warnings.log")
        report = ""
        if self.warnings:
            report += f"{len(self.warnings)} WARNING(S):\n" + "\n".join(self.warnings) + "\n"
        if self.errors:
            report += f"{len(self.errors)} ERROR(S):\n" + "\n".join(self.errors) + "\n"
        if report:
            log_path.write_text(report, encoding="utf-8")
            print(report, file=sys.stderr)
            print(f"Report written to {log_path}", file=sys.stderr)

    def run(self) -> bool:
        self.load_old()
        wb = openpyxl.load_workbook(self.xlsx_path, data_only=True, read_only=True)
        for sheet_name in SHEET_CONFIG:
            self.parse_sheet(sheet_name, wb)
        self.resolve_linked_documents()
        self.flush_report()
        if self.errors:
            print("Conversion aborted due to errors (see log/stderr above).",
                  file=sys.stderr)
            return False

        result = {
            "meta": self.meta_block(),
            "documents": {
                "posthum": {k: self.nest(r) for k, r in self.documents["posthum"].items()},
                "unpublished": {k: self.nest(r) for k, r in self.documents["unpublished"].items()},
                "published": {k: self.nest(r) for k, r in self.documents["published"].items()},
                "audio": {},
            },
        }
        self.out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8")
        self.write_ts_files(self.out_path.parent)
        counts = {s: len(self.documents[s]) for s in SECTION_TYPE_NAMES}
        print(f"Wrote {self.out_path}  ({counts}); TS key files written to "
              f"{self.out_path.parent}.")
        return True


# --------------------------------------------------------------------------


def main() -> None:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--xlsx", required=True, help="input spreadsheet (data.xlsx)")
    ap.add_argument("--old", required=True,
                    help="old_documents.json (source of manuscript.iiif_urls)")
    ap.add_argument("--out", default="documents.json",
                    help="output path (default: documents.json)")
    args = ap.parse_args()

    for label, path in (("--xlsx", Path(args.xlsx)), ("--old", Path(args.old))):
        if not path.is_file():
            sys.exit(f"{label} file not found: {path}")

    ok = Converter(Path(args.xlsx), Path(args.old), Path(args.out)).run()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
