// src/dataFetchers.js
// 楼市洞察日报 - 数据源注册与调度模块
// 直接抓取 RSS 源，无需依赖第三方服务

// ===================== RSS 直接抓取数据源 =====================
import { 
    RealEstateNewsSource, 
    FinanceNewsSource, 
    PolicyNewsSource,
    GeneralNewsSource 
} from './dataSources/rss-feed.js';

// ===================== 原有 Folo 数据源 (已弃用，保留备用) =====================
// import RealEstateNewsDataSource from './dataSources/realestate-news.js';
// import RealEstatePolicyDataSource from './dataSources/realestate-policy.js';
// import RealEstateMarketDataSource from './dataSources/realestate-market.js';
// import RealEstateCityDataSource from './dataSources/realestate-city.js';

/**
 * 数据源注册表
 * 
 * 楼市日报数据分类（直接抓取 RSS）：
 * - news: 楼市资讯 (房产相关新闻)
 * - finance: 财经资讯 (财经新闻，含房产内容)
 * - policy: 政策动态 (政策解读类)
 * - general: 综合资讯 (其他综合类)
 * 
 * RSS 源在 wrangler.toml 中配置，支持多个源用逗号分隔
 */
export const dataSources = {
    // 楼市资讯 - 房产相关新闻
    news: { 
        name: '楼市资讯', 
        sources: [RealEstateNewsSource] 
    },
    
    // 财经资讯 - 综合财经新闻
    finance: { 
        name: '财经资讯', 
        sources: [FinanceNewsSource] 
    },
    
    // 政策动态 - 政策解读
    policy: { 
        name: '政策动态', 
        sources: [PolicyNewsSource] 
    },
    
    // 综合资讯 - 其他来源
    general: { 
        name: '综合资讯', 
        sources: [GeneralNewsSource] 
    },
};

/**
 * Fetches and transforms data from all data sources for a specified type.
 * @param {string} sourceType - The type of data source (e.g., 'news', 'projects', 'papers').
 * @param {object} env - The environment variables.
 * @param {string} [foloCookie] - The Folo authentication cookie.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of unified data objects from all sources of that type.
 */
export async function fetchAndTransformDataForType(sourceType, env, foloCookie) {
    const sources = dataSources[sourceType].sources;
    if (!sources || !Array.isArray(sources)) {
        console.error(`No data sources registered for type: ${sourceType}`);
        return [];
    }

    let allUnifiedDataForType = [];
    for (const dataSource of sources) {
        try {
            // Pass foloCookie to the fetch method of the data source
            const rawData = await dataSource.fetch(env, foloCookie);
            const unifiedData = dataSource.transform(rawData, sourceType);
            allUnifiedDataForType = allUnifiedDataForType.concat(unifiedData);
        } catch (error) {
            console.error(`Error fetching or transforming data from source ${dataSource.type} for type ${sourceType}:`, error.message);
            // Continue to next data source even if one fails
        }
    }

    // Sort by published_date in descending order for each type
    allUnifiedDataForType.sort((a, b) => {
        const dateA = new Date(a.published_date);
        const dateB = new Date(b.published_date);
        return dateB.getTime() - dateA.getTime();
    });

    return allUnifiedDataForType;
}

/**
 * Fetches and transforms data from all registered data sources across all types.
 * @param {object} env - The environment variables.
 * @param {string} [foloCookie] - The Folo authentication cookie.
 * @returns {Promise<object>} A promise that resolves to an object containing unified data for each source type.
 */
export async function fetchAllData(env, foloCookie) {
    const allUnifiedData = {};
    const fetchPromises = [];

    for (const sourceType in dataSources) {
        if (Object.hasOwnProperty.call(dataSources, sourceType)) {
            fetchPromises.push(
                fetchAndTransformDataForType(sourceType, env, foloCookie).then(data => {
                    allUnifiedData[sourceType] = data;
                })
            );
        }
    }
    await Promise.allSettled(fetchPromises); // Use allSettled to ensure all promises complete
    return allUnifiedData;
}

/**
 * Fetches and transforms data from all data sources for a specific category.
 * @param {object} env - The environment variables.
 * @param {string} category - The category to fetch data for (e.g., 'news', 'project', 'paper', 'twitter').
 * @param {string} [foloCookie] - The Folo authentication cookie.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of unified data objects for the specified category.
 */
export async function fetchDataByCategory(env, category, foloCookie) {
    if (!dataSources[category]) {
        console.warn(`Attempted to fetch data for unknown category: ${category}`);
        return [];
    }
    return await fetchAndTransformDataForType(category, env, foloCookie);
}
