//! Hash `salt_hex:hash_hex` com scrypt (N=16384, r=8, p=1, 64 bytes), compatível com os
//! hashes gerados pela API Node (`crypto.scryptSync`), então usuários existentes continuam válidos.
use rand::RngCore;
use scrypt::Params;
use subtle::ConstantTimeEq;

#[derive(Debug, thiserror::Error)]
pub enum PasswordError {
  #[error("parâmetros scrypt inválidos")]
  Params,
}

const KEY_LEN: usize = 64;

fn derive(password: &str, salt: &[u8]) -> Result<[u8; KEY_LEN], PasswordError> {
  let params = Params::new(14, 8, 1, KEY_LEN).map_err(|_| PasswordError::Params)?;
  let mut out = [0u8; KEY_LEN];
  scrypt::scrypt(password.as_bytes(), salt, &params, &mut out).map_err(|_| PasswordError::Params)?;
  Ok(out)
}

pub fn hash_password(password: &str) -> Result<String, PasswordError> {
  let mut salt = [0u8; 16];
  rand::thread_rng().fill_bytes(&mut salt);
  Ok(format!("{}:{}", hex::encode(salt), hex::encode(derive(password, &salt)?)))
}

/// `false` para qualquer hash malformado: nunca entra em pânico com dado vindo do banco.
pub fn check_password(password: &str, stored: &str) -> bool {
  let Some((salt_hex, hash_hex)) = stored.split_once(':') else { return false };
  let (Ok(salt), Ok(expected)) = (hex::decode(salt_hex), hex::decode(hash_hex)) else { return false };
  match derive(password, &salt) {
    Ok(actual) => actual.ct_eq(expected.as_slice()).into(),
    Err(_) => false,
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn roundtrip() {
    let h = hash_password("segredo123").unwrap();
    assert!(check_password("segredo123", &h));
    assert!(!check_password("outra", &h));
  }

  #[test]
  fn hostile_hashes_never_panic() {
    for junk in ["", ":", "zz:zz", "00:", ":00", "abc"] {
      assert!(!check_password("x", junk));
    }
  }
}
