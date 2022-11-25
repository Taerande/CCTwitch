import Vue from "vue";

Vue.filter('commaCase', function(el){
  let regexp = /\B(?=(\d{3})+(?!\d))/g;
  if(el){
    return el.toString().replace(regexp, ',');
  }else{
    return el;
  }
});
Vue.filter('getDurationTime', function(el){
  const regex = /h|m|s/
  const duration = el.split(regex)
  if (duration.length === 4) {
    if (duration[1] === '0') {
      return `${duration[0]}시간`
    }
    return `${duration[0]}시간 ${duration[1]}분`
  }
  if (duration.length === 3) {
    return `${duration[0]}분`
  }
  return '1분 미만'
});
