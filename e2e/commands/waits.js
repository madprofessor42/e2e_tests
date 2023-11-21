module.exports = {
    waitForPageLoaded: async function(page, ms) {
        let old_html = await page.evaluate(() => document.documentElement.innerHTML);
        let new_html = '';

        while (true){
            await page.waitForTimeout(ms);
            new_html = await page.evaluate(() => document.documentElement.innerHTML);
            if (new_html === old_html) break
            old_html = new_html;
            new_html = '';
        }
    }
}