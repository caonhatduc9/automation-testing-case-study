const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

const chromePath = path.join(__dirname, "drivers", "chromedriver");

const options = new chrome.Options();
options.addArguments("--start-maximized");

const driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .build();

async function waitForElement(selector, timeout = 500) {
  try {
    let element = await driver.wait(
      until.elementLocated(By.css(selector)),
      timeout
    );
    return element;
  } catch (error) {
    console.log(`Phần tử không tồn tại sau ${timeout}ms:`, error.message);
    return null;
  }
}

// Hàm đăng nhập
async function login(username, password) {
  await driver.get(
    "http://localhost/orangehrm-4.5/symfony/web/index.php/auth/login"
  );

  const usernameInput = await waitForElement("#txtUsername");
  await usernameInput.sendKeys(username);

  const passwordInput = await waitForElement("#txtPassword");
  await passwordInput.sendKeys(password);

  const loginButton = await waitForElement("#btnLogin");
  await loginButton.click();

  const successMessage = await waitForElement("#welcome");
  const message = await successMessage.getText();
  console.log("Login status:", message);
}

async function executeTest() {
  await login("admin", "10072002@Aw");
  const dataPath = path.join(__dirname, "addEntitilement.csv");
  const resultPath = path.join(__dirname, "addEntitilement-result.csv");

  const dataFile = fs.createReadStream(dataPath);
  const resultFile = fs.createWriteStream(resultPath);
  const headerResult = "TC;Input;Expected output;Actual output\n";
  resultFile.write(headerResult);

  const lineReader = readline.createInterface({
    input: dataFile,
    crlfDelay: Infinity,
  });

  let index = 1;
  let isFirstLine = true;
  let isPass = true;
  let checkAlreadyExists = false;

  for await (const line of lineReader) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    const values = line.split(",");
    console.log(values[0], values[1], values[2], values[3], values[4]);
    // console.log("value 7", values[7]);

    const result = [];
    result.push(
      `#${index};${values[0]}|${values[1]}|${values[2]}|${values[3]};${values[4]}`
    );
    console.log("result", result);
    await driver.findElement(By.css("#menu_leave_viewLeaveModule > b")).click();
    await driver.findElement(By.id("menu_leave_Entitlements")).click();
    await driver.findElement(By.id("menu_leave_addLeaveEntitlement")).click();
    await driver.sleep(1000);

    // await driver.findElement(By.linkText("Add Employee")).click();
    let inputElement = await driver.findElement(
      By.id("entitlements_employee_empName")
    );
    inputElement.click();
    await inputElement.clear();

    await inputElement.sendKeys(values[0]);

    await inputElement.sendKeys(Key.ENTER);
    let inputEntiti = await driver
      .findElement(By.id("entitlements_entitlement"))
      .sendKeys(values[3]);
    await driver.sleep(500);

    let employeeMessage = await driver.findElements(
      By.css("#frmLeaveEntitlementAdd > fieldset > ol > li:nth-child(2) > span")
    );

    if (employeeMessage.length > 0) {
      isPass = false;
      for (let i = 0; i < employeeMessage.length; i++) {
        let text = await employeeMessage[i].getText();
        console.log("employeeMessage", i, ":", text);
        result.push("Input Employee: " + text);
      }
    }

    let entitiMessage = await driver.findElements(
      By.css("#frmLeaveEntitlementAdd > fieldset > ol > li:nth-child(5) > span")
    );

    if (entitiMessage.length > 0) {
      isPass = false;
      for (let i = 0; i < entitiMessage.length; i++) {
        let text = await entitiMessage[i].getText();
        console.log("entitiMessage", i, ":", text);
        result.push("Input Entitielement" + text);
      }
    }
    if (!employeeMessage.length && !entitiMessage.length) {
      result.push("Successfully Saved");
    }

    index++;
    const resultString = result.join(";");
    resultFile.write(resultString + "\n");
  }

  console.log("index", index);
  resultFile.end();
}

async function runTest() {
  try {
    await driver.manage().window().maximize();
    await executeTest();
    // await driver.sleep(100);
  } finally {
    await driver.quit();
  }
}

runTest();
