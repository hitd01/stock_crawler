import puppeteer from 'puppeteer';

/**
 * @route POST /api/hose/get_history
 * @param {ticker, start_date, end_date} req
 * @param {success, message, ? ticker_history_data} res
 */
export const getTickerHistoryData = async (req, res) => {
  try {
    console.log(req.body);
    const { ticker, start_date, end_date } = req.body;
    console.log(ticker, start_date, end_date);
    if (!ticker || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing ticker and/or start_date and/or end_date',
      });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://s.cafef.vn/Lich-su-giao-dich-${ticker}-1.chn`);

    // search
    await page.type('#ContentPlaceHolder1_ctl03_dpkTradeDate1_txtDatePicker', start_date);
    await page.type('#ContentPlaceHolder1_ctl03_dpkTradeDate2_txtDatePicker', end_date);
    await page.waitForSelector('#ContentPlaceHolder1_ctl03_btSearch');
    await page.click('#ContentPlaceHolder1_ctl03_btSearch');

    let ticker_history_data = [];
    let flag = true;
    while (flag) {
      const tickerData = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('#GirdTable2 > tbody > tr'));

        return trs.slice(2).map((tr) => {
          const tds = Array.from(tr.querySelectorAll('td'));
          const tdContents = tds.map((td) => td.textContent.trim());
          return [...tdContents.slice(0, 4), ...tdContents.slice(5, 12)];
        });
      });
      ticker_history_data = [...ticker_history_data, ...tickerData];

      const tdLastChildSelector = await page.waitForSelector(
        'table.CafeF_Paging > tbody > tr > td:last-child'
      );
      let nextPageIcon = await tdLastChildSelector.evaluate((ele) => ele.textContent.trim());
      if (nextPageIcon === '>') {
        await page.click('table.CafeF_Paging > tbody > tr > td:last-child > a');
      } else {
        flag = false;
      }
    }

    await browser.close();

    res.json({
      success: true,
      message: 'Done get stock history data successfully',
      ticker_history_data,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Internet server error',
    });
  }
};
