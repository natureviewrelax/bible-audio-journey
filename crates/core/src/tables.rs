//! Tabelas expostas em `/api/db/:table` e as colunas que o cliente pode tocar (lista de permissão).

#[derive(Debug)]
pub struct TableSpec {
  pub name: &'static str,
  pub pk: &'static str,
  pub columns: &'static [&'static str],
  /// Chave natural usada pelo upsert quando o corpo não traz a PK.
  pub conflict: &'static [&'static str],
  /// Atualiza `updated_at` automaticamente em `update`.
  pub touch_updated_at: bool,
}

impl TableSpec {
  pub fn has_column(&self, column: &str) -> bool {
    self.columns.contains(&column)
  }
}

pub static AUDIO_AUTHORS: TableSpec = TableSpec {
  name: "audio_authors",
  pk: "id",
  columns: &[
    "id",
    "first_name",
    "last_name",
    "ministry_role",
    "biography",
    "email",
    "phone",
    "website",
    "facebook",
    "youtube",
    "instagram",
    "created_at",
  ],
  conflict: &[],
  touch_updated_at: false,
};

pub static VERSE_AUDIO: TableSpec = TableSpec {
  name: "verse_audio",
  pk: "id",
  columns: &["id", "book", "chapter", "verse", "audio_path", "author_id", "created_at"],
  conflict: &["book", "chapter", "verse", "author_id"],
  touch_updated_at: false,
};

pub static BIBLE_VIDEOS: TableSpec = TableSpec {
  name: "bible_videos",
  pk: "id",
  columns: &["id", "youtube_id", "title", "description", "created_at", "updated_at"],
  conflict: &[],
  touch_updated_at: true,
};

pub fn table(name: &str) -> Option<&'static TableSpec> {
  [&AUDIO_AUTHORS, &VERSE_AUDIO, &BIBLE_VIDEOS].into_iter().find(|t| t.name == name)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FilterOp {
  Eq,
  Neq,
  Gt,
  Gte,
  Lt,
  Lte,
  Is,
}

impl FilterOp {
  pub fn parse(op: &str) -> Option<Self> {
    Some(match op {
      "eq" => Self::Eq,
      "neq" => Self::Neq,
      "gt" => Self::Gt,
      "gte" => Self::Gte,
      "lt" => Self::Lt,
      "lte" => Self::Lte,
      "is" => Self::Is,
      _ => return None,
    })
  }

  pub fn sql(self) -> &'static str {
    match self {
      Self::Eq => "=",
      Self::Neq => "<>",
      Self::Gt => ">",
      Self::Gte => ">=",
      Self::Lt => "<",
      Self::Lte => "<=",
      Self::Is => "IS",
    }
  }
}
