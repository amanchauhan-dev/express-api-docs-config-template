function generatePassword(length: number = 12,
    useUppercase: boolean = true,
    useNumbers: boolean = true,
    useSymbols: boolean = true): string {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?/";

    let characterPool = lowercaseChars;

    if (useUppercase) characterPool += uppercaseChars;
    if (useNumbers) characterPool += numberChars;
    if (useSymbols) characterPool += symbolChars;

    if (characterPool.length === 0) {
        throw new Error("No character sets selected for password generation.");
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characterPool.length);
        password += characterPool[randomIndex];
    }

    return password;
}

export { generatePassword }