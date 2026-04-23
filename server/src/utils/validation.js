const validateName = (name) => {
  return /^[A-Za-z]+([ '-][A-Za-z]+)*$/.test(name.trim()) 
         && name.trim().length >= 2 
         && name.trim().length <= 20;
}

export default validateName