import React from 'react'

const Analysis = () => {
  return (
    <div className='analysisPage'>
        <div className='analysisPageTop'>
            <h3>Анализ абонентов</h3>
            <div className='analysisPageSearch'>
                <input placeholder='Введите адрес'/>
                <button type='submit'>Найти</button>
            </div>
        </div>
        <div className='analysisPageMain'>
            <div className='analysisPageLeft'>
                <div>
                    <h3>Личная информация</h3>
                    <div className='analysisPageInf'>
        {/*!!!!!!!!!*/}               <div><p>ID</p>   <label>1297</label>   </div>
        {/*!!!!!!!!!*/}               <div><p>Адрес</p>   <label>г.Краснодар, ул.Красная, д4</label>   </div>
        {/*!!!!!!!!!*/}               <div><p>Email</p>   <label>mail@mail.com</label>   </div>
        {/*!!!!!!!!!*/}               <div><p>Телефон</p>   <label>+7 (904) 245-45-45</label>   </div>
                    </div>
                </div> 
                
                <div className='analysisPageDown'>
                    <div>
                        <h3>Дополнительная информация</h3>
                        <div className='analysisPageLinks'>
                            <div><p>2gis</p>   <label>Найдена 1 ссылка</label><a>Подробнее...</a></div>
                            <div><p>YandexMaps</p>   <label>Найдена 1 ссылка</label><a>Подробнее...</a></div>
                            <div><p>Avito</p>   <label>Найдена 1 ссылка</label><a>Подробнее...</a></div>
                            <div><p>VK</p>   <label>Найдена 1 ссылка</label><a>Подробнее...</a></div>
                        </div>
                    </div>
                    <div className='analysisPagePhoro'>
                        PHOTO
                    </div>
                </div>
            </div>
            <div className='analysisPageRight'>
                <div className="">
                    <p>Среднее потребление в месяц</p>
                    <label>1.27</label>
                    <div className="SupSub">
                        <sup>МВт</sup><sub>ч/сутки</sub>
                    </div>
                </div>
                <div className="">
                    <p>Среднее потребление в месяц</p>
                    <label>1.27</label>
                    <div className="SupSub">
                        <sup>МВт</sup><sub>ч/сутки</sub>
                    </div>
                </div>
                <div className="">
                    <p>Среднее потребление в месяц</p>
                    <label>1.27</label>
                    <div className="SupSub">
                        <sup>МВт</sup><sub>ч/сутки</sub>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Analysis;
