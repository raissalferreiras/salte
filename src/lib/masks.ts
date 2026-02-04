// Input mask utilities

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function validateFullName(name: string): { valid: boolean; message?: string } {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length < 2) {
    return { valid: false, message: 'Digite o nome completo (nome e sobrenome)' };
  }
  
  if (words.some(w => w.length < 2)) {
    return { valid: false, message: 'Cada parte do nome deve ter pelo menos 2 letras' };
  }
  
  return { valid: true };
}

export function validateBirthDate(dateStr: string, type: 'crianca' | 'adulto' = 'adulto'): { valid: boolean; message?: string } {
  if (!dateStr) return { valid: true }; // Optional field
  
  const date = new Date(dateStr);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  
  // Check if date is in the future
  if (date > today) {
    return { valid: false, message: 'Data de nascimento não pode ser no futuro' };
  }
  
  // For children: born after 2008 (max 17 years old in 2025)
  if (type === 'crianca') {
    const minYear = today.getFullYear() - 17; // Children are 0-17 years
    if (date.getFullYear() < minYear) {
      return { valid: false, message: `Crianças devem ter nascido após ${minYear}` };
    }
  }
  
  // For adults: max 110 years old
  if (age > 110) {
    return { valid: false, message: 'Idade máxima permitida é 110 anos' };
  }
  
  return { valid: true };
}
