import React, { Component } from 'react'
import Item from './Item';
import _ from 'lodash';
import './index.scss';

/* eslint-disable no-undef */
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});
/* eslint-enable no-undef */

export default class BackgroundList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            backgorundList: [
                {
                    name: "AS2 - PzKpfw VI Ausf. E \"Tiger\" - Winter",
                    backgroundUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SRYAFMIcKL_PArgVSL403ulRUWEndVKv0jp6KCw07dVNS7-vzKVNhhaqadDlHv93jxobflfalN73TwjwJ6ZZyjLGQ9Nn33hq-uxSgS0iu4w/",
                    marketPrice: "¥ 0.23",
                    marketUrl: "https://steamcommunity.com/market/listings/753/991980-Cozy%20Cottage%20-%20Team%20Fortress%202%20Holiday"
                },
                {
                    name: "xxxxxxxx",
                    backgroundUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SRYAFMIcKL_PArgVSL403ulRUWEndVKv0jp6KCw07dVNS7-vzKVNhhaqadDlHv93jxobflfalN73TwjwJ6ZZyjLGQ9Nn33hq-uxSgS0iu4w/",
                    marketPrice: "¥ 0.23",
                    marketUrl: "https://steamcommunity.com/market/listings/753/991980-Cozy%20Cottage%20-%20Team%20Fortress%202%20Holiday"
                },
                {
                    name: "2222222",
                    backgroundUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SRYAFMIcKL_PArgVSL403ulRUWEndVKv0jp6KCw07dVNS7-vzKVNhhaqadDlHv93jxobflfalN73TwjwJ6ZZyjLGQ9Nn33hq-uxSgS0iu4w/",
                    marketPrice: "¥ 0.23",
                    marketUrl: "https://steamcommunity.com/market/listings/753/991980-Cozy%20Cottage%20-%20Team%20Fortress%202%20Holiday"
                }
            ]
        };
    }

    render() {
        const backgorundList = this.state.backgorundList;

        return (
            <div className="backgorund-list">
                <ul>
                    {
                        backgorundList.map((item) =>
                            <Item key={item.name} data={item} onStar={this.starItem} />
                        )
                    }

                </ul>
            </div>
        )
    }

    componentDidMount() {

    }
    /**
     * starHandle
     * 暂存当前项目
     */
    starItem = name => {
        let index = _.findIndex(this.state.backgorundList, ['name', name]);
        let cache = this.state.backgorundList.slice();
        let itemCache = cache[index];
        cache.splice(index, 1);
        cache.unshift(itemCache);
        this.setState({
            backgorundList: cache
        });
    }


}
