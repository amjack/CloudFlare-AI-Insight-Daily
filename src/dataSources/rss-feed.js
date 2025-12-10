// src/dataSources/rss-feed.js
// 通用 RSS 数据源 - 直接抓取 RSS/Atom Feed，不依赖第三方服务
import { getRandomUserAgent, sleep, isDateWithinLastDays, stripHtml, formatDateToChineseWithTime, escapeHtml } from '../helpers.js';

/**
 * 解析 RSS/Atom Feed XML
 * @param {string} xmlText - XML 文本
 * @returns {Array} 解析后的文章列表
 */
function parseRSSFeed(xmlText) {
    const items = [];
    
    // 尝试解析 RSS 2.0 格式
    const rssItemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = rssItemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];
        
        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
        const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded') || '';
        const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');
        const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator') || '';
        
        if (title && link) {
            items.push({
                title: decodeHTMLEntities(title),
                link: link,
                description: description,
                pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                author: decodeHTMLEntities(author)
            });
        }
    }
    
    // 如果 RSS 2.0 解析失败，尝试 Atom 格式
    if (items.length === 0) {
        const atomEntryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
        
        while ((match = atomEntryRegex.exec(xmlText)) !== null) {
            const entryXml = match[1];
            
            const title = extractTag(entryXml, 'title');
            const link = extractAtomLink(entryXml);
            const summary = extractTag(entryXml, 'summary') || extractTag(entryXml, 'content') || '';
            const published = extractTag(entryXml, 'published') || extractTag(entryXml, 'updated');
            const author = extractTag(entryXml, 'name'); // Atom author/name
            
            if (title && link) {
                items.push({
                    title: decodeHTMLEntities(title),
                    link: link,
                    description: summary,
                    pubDate: published ? new Date(published).toISOString() : new Date().toISOString(),
                    author: decodeHTMLEntities(author || '')
                });
            }
        }
    }
    
    return items;
}

/**
 * 从 XML 中提取标签内容
 */
function extractTag(xml, tagName) {
    // 处理 CDATA
    const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch) {
        return cdataMatch[1].trim();
    }
    
    // 普通标签
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}

/**
 * 提取 Atom 格式的链接
 */
function extractAtomLink(xml) {
    // 优先获取 alternate 类型的链接
    const altMatch = xml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
    if (altMatch) return altMatch[1];
    
    // 其次获取任意 href
    const hrefMatch = xml.match(/<link[^>]*href=["']([^"']+)["']/i);
    return hrefMatch ? hrefMatch[1] : '';
}

/**
 * 解码 HTML 实体
 */
function decodeHTMLEntities(text) {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(num));
}

/**
 * 创建 RSS 数据源
 * @param {string} sourceType - 数据源类型标识
 * @param {string} sourceName - 数据源显示名称
 * @param {string} envKeyUrl - 环境变量中 RSS URL 的 key
 * @param {string} emoji - 显示用的 emoji
 */
export function createRSSDataSource(sourceType, sourceName, envKeyUrl, emoji = '📰') {
    return {
        type: sourceType,
        
        async fetch(env) {
            // 支持多个 RSS 源，用逗号分隔
            const rssUrls = env[envKeyUrl];
            
            if (!rssUrls) {
                console.warn(`${envKeyUrl} is not set. Skipping ${sourceName} fetch.`);
                return { items: [] };
            }
            
            const urlList = rssUrls.split(',').map(url => url.trim()).filter(url => url);
            const allItems = [];
            const filterDays = parseInt(env.RSS_FILTER_DAYS || '2', 10);
            
            for (const rssUrl of urlList) {
                try {
                    console.log(`Fetching RSS: ${rssUrl}`);
                    
                    const response = await fetch(rssUrl, {
                        headers: {
                            'User-Agent': getRandomUserAgent(),
                            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                        }
                    });
                    
                    if (!response.ok) {
                        console.error(`Failed to fetch RSS ${rssUrl}: ${response.status}`);
                        continue;
                    }
                    
                    const xmlText = await response.text();
                    const items = parseRSSFeed(xmlText);
                    
                    // 提取 Feed 标题作为来源
                    const feedTitle = extractTag(xmlText, 'title') || new URL(rssUrl).hostname;
                    
                    // 过滤指定天数内的数据
                    const filteredItems = items.filter(item => 
                        isDateWithinLastDays(item.pubDate, filterDays)
                    );
                    
                    // 添加来源信息
                    filteredItems.forEach(item => {
                        item.source = decodeHTMLEntities(feedTitle);
                        item.id = generateItemId(item.link);
                    });
                    
                    allItems.push(...filteredItems);
                    console.log(`Fetched ${filteredItems.length} items from ${feedTitle}`);
                    
                } catch (error) {
                    console.error(`Error fetching RSS ${rssUrl}:`, error.message);
                }
                
                // 请求间隔，避免被限流
                await sleep(500 + Math.random() * 1000);
            }
            
            // 按发布时间排序
            allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            
            return {
                title: sourceName,
                items: allItems
            };
        },
        
        transform(rawData, dataSourceType) {
            if (!rawData || !rawData.items) {
                return [];
            }
            
            return rawData.items.map(item => ({
                id: item.id,
                type: dataSourceType,
                url: item.link,
                title: item.title,
                description: stripHtml(item.description || '').substring(0, 500),
                published_date: item.pubDate,
                authors: item.author || '未知',
                source: item.source || sourceName,
                details: {
                    content_html: item.description || ''
                }
            }));
        },
        
        generateHtml(item) {
            return `
                <strong>${emoji} ${escapeHtml(item.title)}</strong><br>
                <small>来源: ${escapeHtml(item.source)} | ${formatDateToChineseWithTime(item.published_date)}</small>
                <div class="content-html">${item.details.content_html || '暂无详细内容'}</div>
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">阅读原文 →</a>
            `;
        }
    };
}

/**
 * 生成文章唯一 ID
 */
function generateItemId(url) {
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// ===================== 预定义的楼市数据源 =====================

/**
 * 楼市资讯数据源
 */
export const RealEstateNewsSource = createRSSDataSource(
    'news',
    '楼市资讯',
    'RSS_REALESTATE_NEWS',
    '🏠'
);

/**
 * 财经新闻数据源（包含房产内容）
 */
export const FinanceNewsSource = createRSSDataSource(
    'finance',
    '财经资讯',
    'RSS_FINANCE_NEWS',
    '📊'
);

/**
 * 政策动态数据源
 */
export const PolicyNewsSource = createRSSDataSource(
    'policy',
    '政策动态',
    'RSS_POLICY_NEWS',
    '📜'
);

/**
 * 综合资讯数据源
 */
export const GeneralNewsSource = createRSSDataSource(
    'general',
    '综合资讯',
    'RSS_GENERAL_NEWS',
    '📰'
);

export default {
    createRSSDataSource,
    RealEstateNewsSource,
    FinanceNewsSource,
    PolicyNewsSource,
    GeneralNewsSource
};

