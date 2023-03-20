import puppeteer from 'puppeteer';

/**
 * @route POST /api/hose/get_history
 * @param { ticker, start_date, end_date } req
 * @param { success, message, ? ticker_history_data, ? isHoSe } res
 */
export const getTickerHistoryData = async (req, res) => {
  // const browser = await puppeteer.launch({ headless: false, defaultViewport: false });
  const browser = await puppeteer.launch();
  try {
    console.log(req.body);
    const { ticker, start_date, end_date } = req.body;

    if (!ticker || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing ticker and/or start_date and/or end_date',
      });
    }

    const page = await browser.newPage();
    await page.goto(`https://s.cafef.vn/Lich-su-giao-dich-${ticker}-1.chn`);

    // search
    await page.type('#ContentPlaceHolder1_ctl03_dpkTradeDate1_txtDatePicker', start_date);
    await page.type('#ContentPlaceHolder1_ctl03_dpkTradeDate2_txtDatePicker', end_date);
    await page.waitForSelector('#ContentPlaceHolder1_ctl03_btSearch');
    await page.click('#ContentPlaceHolder1_ctl03_btSearch');
    await new Promise((resolve) => setTimeout(resolve, 500));

    let tableId = '';
    const tableHoSE = await page.$(`#GirdTable2`);
    const tableNotHoSE = await page.$(`#GirdTable`);
    if (tableHoSE) {
      tableId = 'GirdTable2';
    } else if (tableNotHoSE) {
      tableId = 'GirdTable';
    }

    if (tableId !== '') {
      const pagingCount = await page.$eval(
        'table.CafeF_Paging > tbody > tr',
        (ele) => ele.querySelectorAll('td').length
      );
      console.log('pagingCount: ', pagingCount);

      const headerCount = await page.$eval(
        `#${tableId} > tbody > tr:first-child`,
        (ele) => ele.querySelectorAll('td').length
      );
      console.log('headerCount: ', headerCount);

      await page.waitForSelector(`#${tableId} > tbody`);

      let ticker_history_data = [];
      let flag = true;
      while (flag) {
        let tickerData = [];
        if (tableId === 'GirdTable' && headerCount === 10) {
          tickerData = await page.$$eval(`#${tableId} > tbody > tr`, (trs) => {
            return trs.slice(2).map((tr) => {
              const tds = Array.from(tr.querySelectorAll('td'));
              const tdContents = tds.map((td) => td.textContent.trim());
              return [...tdContents.slice(0, 4), ...tdContents.slice(5)];
            });
          });
        } else if (tableId === 'GirdTable' && headerCount === 11) {
          tickerData = await page.$$eval(`#${tableId} > tbody > tr`, (trs) => {
            return trs.slice(2).map((tr) => {
              const tds = Array.from(tr.querySelectorAll('td'));
              const tdContents = tds.map((td) => td.textContent.trim());
              return [...tdContents.slice(0, 5), ...tdContents.slice(6)];
            });
          });
        } else {
          tickerData = await page.$$eval(`#${tableId} > tbody > tr`, (trs) => {
            return trs.slice(2).map((tr) => {
              const tds = Array.from(tr.querySelectorAll('td'));
              const tdContents = tds.map((td) => td.textContent.trim());
              return [...tdContents.slice(0, 4), ...tdContents.slice(5, 12)];
            });
          });
        }
        ticker_history_data = [...ticker_history_data, ...tickerData];
        console.log(ticker_history_data);

        if (pagingCount > 1) {
          await page.waitForSelector('table.CafeF_Paging');
          const nextPageIcon = await page.$eval(
            'table.CafeF_Paging > tbody > tr > td:last-child',
            (ele) => ele.textContent.trim()
          );
          console.log('nextPageIcon: ', nextPageIcon);
          if (nextPageIcon === '>') {
            await page.waitForSelector('table.CafeF_Paging > tbody > tr > td:last-child > a');
            await page.click('table.CafeF_Paging > tbody > tr > td:last-child > a');
            await new Promise((resolve) => setTimeout(resolve, 500));
            await page.waitForSelector(`#${tableId} > tbody`);
          } else {
            flag = false;
          }
        } else {
          flag = false;
        }
      }

      await browser.close();

      res.json({
        success: true,
        message: 'Get stock history data successfully',
        ticker_history_data,
      });
    } else {
      await browser.close();
      res.json({
        success: true,
        message: 'Get stock history data successfully',
        ticker_history_data: [],
      });
    }
  } catch (error) {
    await browser.close();
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
