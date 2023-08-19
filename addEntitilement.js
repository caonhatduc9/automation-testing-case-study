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
    // await inputElement.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
    await driver.sleep(1000);
    await inputElement.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);

    await inputElement.sendKeys(values[0]);

    await inputElement.sendKeys(Key.ENTER);
    // await driver.sleep(1000);
    // let selectElement = await driver.findElement(
    //   By.id("entitlements_leave_type")
    // );
    let inputEntiti = await driver
      .findElement(By.id("entitlements_entitlement"))
      .sendKeys(values[3]);
    await driver.sleep(1000);
    await driver.findElement(By.id("btnSave")).click();

    // await driver.sleep(1000);

    // await driver
    //   .findElement(By.id("entitlements_employee_empName"))
    //   .sendKeys(Key.DELETE);
    // await driver.findElement(By.id("employeeId")).sendKeys(values[0]);

    // await driver.findElement(By.css("fieldset > ol > li:nth-child(2)")).click();
    // await driver.findElement(By.id("entitlements_employee_empName")).click();
    // await driver.findElement(By.css(".ac_even")).click();

    // await driver.sleep(1000);

    // return 0;
    // await driver.findElement(By.name("firstName")).sendKeys(values[1]);

    // await driver.findElement(By.name("middleName")).sendKeys(values[2]);

    // await driver.findElement(By.name("lastName")).sendKeys(values[3]);

    // await driver
    //   .findElement(By.id("employeeId"))
    //   .sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
    // await driver.findElement(By.id("employeeId")).sendKeys(values[0]);

    // await driver.sleep(100);
    // console.log("Waiting for");

    // const checkbox = await driver.findElement(By.id("chkLogin"));
    // const isSelected = await checkbox.isSelected();
    // if (!isSelected) await driver.findElement(By.id("chkLogin")).click();
    // console.log("Waiting for1");

    // await driver.findElement(By.id("user_name")).sendKeys(values[4]);
    // console.log("Waiting for2");
    // await driver.findElement(By.id("user_password")).sendKeys(values[5]);
    // await driver.findElement(By.id("re_password")).click();
    // await driver.findElement(By.id("re_password")).sendKeys(values[6]);
    // await driver.sleep(100);

    // await driver.findElement(By.id("btnSave")).click();
    // await driver.sleep(1200);
    // console.log("check bẻoe");

    // try {
    //   let isSuccess = await waitForElement("#addEmployeeTbl > div");
    //   console.log("check success", isSuccess);
    //   if (isSuccess) {
    //     checkAlreadyExists = true;
    //     let text = await isSuccess.getText();
    //     console.log("isSuccess:", text);
    //     result.push(text);
    //   }
    // } catch (error) {
    //   console.log("Phần tử không tồn tại:", error.message);
    // }

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

    // let lastnameMessage = await driver.findElements(
    //   By.css(
    //     "#frmAddEmp > fieldset > ol > li.line.nameContainer > ol > li:nth-child(3) > span"
    //   )
    // );

    // if (lastnameMessage.length > 0 && lastnameMessage.length == 0) {
    //   isPass = false;
    //   for (let i = 0; i < lastnameMessage.length; i++) {
    //     let text = await lastnameMessage[i].getText();
    //     console.log("lastnameMessage", i, ":", text);
    //     result.push("Input LastName: " + text);
    //   }
    // }

    // let usernameMessage = await driver.findElements(
    //   By.css("#frmAddEmp > fieldset > ol > li:nth-child(5) > span")
    // );

    // if (usernameMessage.length > 0) {
    //   isPass = false;
    //   for (let i = 0; i < usernameMessage.length; i++) {
    //     let text = await usernameMessage[i].getText();
    //     console.log("userName", i, ":" + text);
    //     result.push("Input username:" + text);
    //   }
    // }

    // let passwordMessage = await driver.findElements(
    //   By.css("#frmAddEmp > fieldset > ol > li:nth-child(6) > span")
    // );

    // if (passwordMessage.length > 0) {
    //   isPass = false;
    //   for (let i = 0; i < passwordMessage.length; i++) {
    //     let text = await passwordMessage[i].getText();
    //     console.log("passwordMessage", i, ":", text);
    //     result.push("Input password: " + text);
    //   }
    // }

    // let confirmPasswordMessage = await driver.findElements(
    //   By.css("#frmAddEmp > fieldset > ol > li:nth-child(7) > span")
    // );

    // if (confirmPasswordMessage.length > 0) {
    //   isPass = false;
    //   for (let i = 0; i < confirmPasswordMessage.length; i++) {
    //     let text = await confirmPasswordMessage[i].getText();
    //     console.log("confirmPasswordMessage", i, ":", text);
    //     result.push("Input confirmPassword: " + text);
    //   }
    // }

    // // await driver.sleep(1500);
    // await driver.findElement(By.css("#menu_pim_viewPimModule > b")).click();
    // // Thực hiện thêm nhân viên
    // await driver.findElement(By.id("menu_pim_addEmployee")).click();
    // await driver.findElement(By.linkText("Employee List")).click();
    // // await driver.sleep(1500);
    // if (checkAlreadyExists === false) {
    //   const table = await waitForElement("#resultTable");
    //   if (table) {
    //     const rows = await table.findElements(By.css("tbody tr"));
    //     console.log("row", rows);
    //     // Số cột mà bạn muốn lấy giá trị (ví dụ: cột thứ 2)
    //     const columnIndex = 0; // (đánh số cột từ 0)
    //     let count = 0;
    //     for (let i = 0; i < rows.length; i++) {
    //       const cells = await rows[i].findElements(By.css("td"));

    //       const cellTextElement = await cells[1].findElement(By.css("a"));
    //       const cellText = await cellTextElement.getAttribute("innerText");
    //       console.log("Giá trị ô:", cellText);
    //       if (cellText === values[0]) {
    //         count++;
    //         result.push("Successfully Saved");
    //         console.log("result finally", result);
    //         break;
    //       }
    //     }
    //   }
    // }
    // checkAlreadyExists = false;
    // console.log("check exsif for=" + values[0] + "==" + checkAlreadyExists);
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
