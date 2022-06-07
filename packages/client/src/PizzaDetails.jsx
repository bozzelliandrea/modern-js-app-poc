import {useEffect} from 'react';
import {useQuery} from 'urql';
import {useParams} from 'react-router-dom';
import {Container} from 'reactstrap';
import Pizza from './Pizza';

const pizzaQuery = `query($pizzaId: Int!) { 
  pizza(id: $pizzaId) {
    id
    name
    image
    toppings {
      id
      name
      type
    }
  }
}`;

export default function PizzaDetails() {
  const {pizzaId} = useParams();
  const [result, reexecuteQuery] = useQuery({
    query: pizzaQuery,
    variables: {pizzaId: Number.parseInt(pizzaId, 10)},
  });

  useEffect(() => {
    console.log(result);
  }, [result]);

  const {data, fetching, error} = result;

  if (error) {
    return <span>something went wrong: {error.message}</span>;
  }

  if (fetching) {
    return <span>Loading...</span>;
  }

  return (
    <Container className="my-2">
      <Pizza {...data.pizza} />
    </Container>
  );
}
